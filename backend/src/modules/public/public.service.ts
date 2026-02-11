// ============================================================
// Public Service — No authentication required
// ============================================================
import { supabaseAdmin } from '../../config/supabase';
import { AppError, ErrorCode } from '../../utils/errors';
import { studentService } from '../student/student.service';

export class PublicService {
    /**
     * Lookup allocation by matric number.
     * Returns hostel, room, bed space, and roommate info.
     */
    async getAllocationByMatric(matricNumber: string): Promise<unknown> {
        // Find student by matric number
        const { data: student, error: studentErr } = await supabaseAdmin
            .from('profiles')
            .select('id, matric_number, first_name, last_name, department, level, gender')
            .eq('matric_number', matricNumber)
            .is('deleted_at', null)
            .single();

        if (studentErr || !student) {
            throw AppError.notFound(ErrorCode.NOT_FOUND, 'No student found with this matric number');
        }

        // Get active session
        const { data: session } = await supabaseAdmin
            .from('academic_sessions')
            .select('id, name')
            .eq('is_active', true)
            .maybeSingle();

        if (!session) {
            return null;
        }

        // Get allocation for this student in the active session
        const { data: allocation, error: allocErr } = await supabaseAdmin
            .from('allocations')
            .select(`
        id, bed_space_number, allocation_date, allocation_type, status,
        room:rooms(id, room_number, floor_number, capacity, current_occupancy, room_type),
        hostel:hostels(id, name, gender)
      `)
            .eq('student_id', student.id)
            .eq('session_id', session.id)
            .in('status', ['active', 'checked_in'])
            .maybeSingle();

        if (allocErr || !allocation) {
            throw AppError.notFound(ErrorCode.ALLOC_NOT_FOUND, 'No allocation found for this student in the current session');
        }

        // Get roommates
        const { data: roommates } = await supabaseAdmin
            .from('allocations')
            .select(`
        bed_space_number,
        student:profiles!allocations_student_id_fkey(
          first_name, last_name, matric_number, department, level
        )
      `)
            .eq('room_id', (allocation as any).room.id)
            .eq('session_id', session.id)
            .in('status', ['active', 'checked_in'])
            .neq('student_id', student.id);

        return {
            matric_number: student.matric_number,
            student_name: `${student.first_name} ${student.last_name}`,
            session: session.name,
            hostel_name: (allocation as any).hostel.name,
            room_number: (allocation as any).room.room_number,
            floor_number: (allocation as any).room.floor_number,
            bed_space_number: allocation.bed_space_number,
            room_capacity: (allocation as any).room.capacity,
            current_occupants: (allocation as any).room.current_occupancy,
            allocation_date: allocation.allocation_date,
            status: allocation.status,
            roommates: (roommates || []).map((r: any) => ({
                name: `${r.student.first_name} ${r.student.last_name}`,
                matric_number: r.student.matric_number,
                department: r.student.department,
                level: r.student.level,
            })),
        };
    }

    /**
     * Public application status lookup by matric number + surname.
     * No login required — low-friction alternative to auth-based status.
     */
    async getApplicationStatus(matricNumber: string, surname: string): Promise<unknown> {
        return studentService.getPublicStatus(matricNumber, surname);
    }

    /**
     * Get all active hostels (public — no authentication required).
     * Used by student hostel application form to populate hostel choices.
     */
    async getHostels(): Promise<unknown[]> {
        const { data, error } = await supabaseAdmin
            .from('hostels')
            .select('id, name, gender, total_capacity, current_occupancy, is_active, description')
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('name');

        if (error) {
            console.error('[PUBLIC HOSTELS ERROR]', error);
            return [];
        }
        return data || [];
    }
}

export const publicService = new PublicService();
