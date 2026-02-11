// ============================================================
// Warden Service
// ============================================================
import { supabaseAdmin } from '../../config/supabase';
import { AppError, ErrorCode } from '../../utils/errors';
import { Allocation, Hostel, Room } from '../../types';

export class WardenService {
    /**
     * Get hostels assigned to this warden
     */
    async getAssignedHostels(wardenId: string): Promise<Hostel[]> {
        const { data, error } = await supabaseAdmin
            .from('warden_assignments')
            .select(`
        hostel:hostels(*)
      `)
            .eq('warden_id', wardenId)
            .eq('is_active', true);

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch assigned hostels');
        return (data || []).map((d: any) => d.hostel) as Hostel[];
    }

    /**
     * Get rooms with occupancy for an assigned hostel
     */
    async getRoomOccupancy(wardenId: string, hostelId: string): Promise<Room[]> {
        // Verify assignment
        await this.verifyAssignment(wardenId, hostelId);

        const { data, error } = await supabaseAdmin
            .from('rooms')
            .select(`
        *,
        allocations(
          id, student_id, bed_space_number, status,
          student:profiles!allocations_student_id_fkey(
            id, matric_number, first_name, last_name, level, department
          )
        )
      `)
            .eq('hostel_id', hostelId)
            .is('deleted_at', null)
            .order('room_number');

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch rooms');
        return (data || []) as unknown as Room[];
    }

    /**
     * Check-in a student
     */
    async checkIn(wardenId: string, allocationId: string, notes?: string): Promise<Allocation> {
        const allocation = await this.getAllocationForAction(wardenId, allocationId);

        if ((allocation as Allocation).status === 'checked_in') {
            throw AppError.conflict(ErrorCode.CONFLICT, 'Student is already checked in');
        }

        // Update allocation
        const { data: updated, error } = await supabaseAdmin
            .from('allocations')
            .update({ status: 'checked_in' })
            .eq('id', allocationId)
            .select()
            .single();

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to check in student');

        // Log the action
        await supabaseAdmin.from('check_in_out').insert({
            allocation_id: allocationId,
            student_id: (allocation as any).student_id,
            action: 'check_in',
            performed_by: wardenId,
            notes: notes || null,
        });

        return updated as Allocation;
    }

    /**
     * Check-out a student
     */
    async checkOut(wardenId: string, allocationId: string, notes?: string): Promise<Allocation> {
        const allocation = await this.getAllocationForAction(wardenId, allocationId);

        if ((allocation as Allocation).status !== 'checked_in') {
            throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'Student must be checked in first');
        }

        // Update allocation
        const { data: updated, error } = await supabaseAdmin
            .from('allocations')
            .update({ status: 'checked_out' })
            .eq('id', allocationId)
            .select()
            .single();

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to check out student');

        // Decrement room and hostel occupancy
        await supabaseAdmin
            .from('rooms')
            .update({ current_occupancy: Math.max(0, ((allocation as any).room?.current_occupancy || 1) - 1) })
            .eq('id', (allocation as any).room_id);

        await supabaseAdmin
            .from('hostels')
            .update({ current_occupancy: Math.max(0, ((allocation as any).hostel?.current_occupancy || 1) - 1) })
            .eq('id', (allocation as any).hostel_id);

        // Log the action
        await supabaseAdmin.from('check_in_out').insert({
            allocation_id: allocationId,
            student_id: (allocation as any).student_id,
            action: 'check_out',
            performed_by: wardenId,
            notes: notes || null,
        });

        return updated as Allocation;
    }

    // Private helpers
    private async verifyAssignment(wardenId: string, hostelId: string): Promise<void> {
        const { data } = await supabaseAdmin
            .from('warden_assignments')
            .select('id')
            .eq('warden_id', wardenId)
            .eq('hostel_id', hostelId)
            .eq('is_active', true)
            .maybeSingle();

        if (!data) {
            throw AppError.forbidden('You are not assigned to this hostel');
        }
    }

    private async getAllocationForAction(wardenId: string, allocationId: string): Promise<Allocation> {
        const { data: allocation, error } = await supabaseAdmin
            .from('allocations')
            .select('*, room:rooms(id, hostel_id, current_occupancy), hostel:hostels(id, current_occupancy)')
            .eq('id', allocationId)
            .single();

        if (error || !allocation) {
            throw AppError.notFound(ErrorCode.ALLOC_NOT_FOUND, 'Allocation not found');
        }

        // Verify warden has access to this hostel
        await this.verifyAssignment(wardenId, (allocation as any).hostel_id);

        return allocation as unknown as Allocation;
    }
}

export const wardenService = new WardenService();
