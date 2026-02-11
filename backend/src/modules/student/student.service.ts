// ============================================================
// Student Service — Minimal, task-oriented flow
// ============================================================
import { supabaseAdmin } from '../../config/supabase';
import { AppError, ErrorCode } from '../../utils/errors';
import { HostelApplication, Profile } from '../../types';

/**
 * Computed application status derived from database state.
 * This is the SINGLE SOURCE OF TRUTH — no UI state, no cached status.
 */
export type ComputedStatus =
    | 'NO_APPLICATION'
    | 'SUBMITTED'
    | 'AWAITING_VERIFICATION'
    | 'VERIFIED'
    | 'BALLOTED'
    | 'ALLOCATED'
    | 'NOT_ALLOCATED'
    | 'REJECTED';

export interface StudentStatus {
    status: ComputedStatus;
    session: { id: string; name: string } | null;
    application: {
        id: string;
        application_date: string;
        first_choice: { id: string; name: string } | null;
        second_choice: { id: string; name: string } | null;
        third_choice: { id: string; name: string } | null;
        payment_receipt_uploaded: boolean;
        payment_verified: boolean;
        payment_verified_at: string | null;
    } | null;
    allocation: {
        hostel_name: string;
        room_number: string;
        floor_number: number;
        bed_space_number: number;
        allocation_date: string;
    } | null;
}

export class StudentService {
    // -------------------------------------------------------
    // POST /api/student/apply
    // -------------------------------------------------------
    async applyForHostel(
        studentId: string,
        data: {
            first_choice_hostel_id: string;
            second_choice_hostel_id?: string;
            third_choice_hostel_id?: string;
        }
    ): Promise<HostelApplication> {
        // 1. Check student eligibility
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', studentId)
            .single();

        if (!profile || !(profile as Profile).is_eligible) {
            throw AppError.badRequest(ErrorCode.APP_NOT_ELIGIBLE, 'You are not eligible to apply');
        }

        // 2. Get active session
        const session = await this.getActiveSession();

        // 3. Check application window
        const now = new Date();
        if (now < new Date(session.application_start_date) || now > new Date(session.application_end_date)) {
            throw AppError.badRequest(ErrorCode.APP_PERIOD_CLOSED, 'Application period is closed');
        }

        // 4. Check for existing application (ONE per session)
        const { data: existingApp } = await supabaseAdmin
            .from('hostel_applications')
            .select('id')
            .eq('student_id', studentId)
            .eq('session_id', session.id)
            .maybeSingle();

        if (existingApp) {
            throw AppError.conflict(ErrorCode.APP_ALREADY_APPLIED, 'You have already applied for this session');
        }

        // 5. Check for existing allocation
        const { data: existingAlloc } = await supabaseAdmin
            .from('allocations')
            .select('id')
            .eq('student_id', studentId)
            .eq('session_id', session.id)
            .in('status', ['active', 'checked_in'])
            .maybeSingle();

        if (existingAlloc) {
            throw AppError.conflict(ErrorCode.ALLOC_ALREADY_ALLOCATED, 'You already have an allocation for this session');
        }

        // 6. Validate hostel preferences match student gender
        const hostelIds = [
            data.first_choice_hostel_id,
            data.second_choice_hostel_id,
            data.third_choice_hostel_id,
        ].filter(Boolean) as string[];

        const { data: hostels } = await supabaseAdmin
            .from('hostels')
            .select('id, gender, is_active')
            .in('id', hostelIds);

        if (!hostels || hostels.length === 0) {
            throw AppError.badRequest(ErrorCode.APP_INVALID_PREFERENCE, 'Invalid hostel selection');
        }

        for (const hostel of hostels) {
            if (hostel.gender !== (profile as Profile).gender) {
                throw AppError.badRequest(ErrorCode.ALLOC_GENDER_MISMATCH, 'Hostel selection does not match your gender');
            }
            if (!hostel.is_active) {
                throw AppError.badRequest(ErrorCode.APP_INVALID_PREFERENCE, 'Selected hostel is not active');
            }
        }

        // 7. Create application
        const { data: application, error } = await supabaseAdmin
            .from('hostel_applications')
            .insert({
                student_id: studentId,
                session_id: session.id,
                first_choice_hostel_id: data.first_choice_hostel_id,
                second_choice_hostel_id: data.second_choice_hostel_id || null,
                third_choice_hostel_id: data.third_choice_hostel_id || null,
                status: 'pending',
            })
            .select()
            .single();

        if (error || !application) {
            throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to create application');
        }

        return application as HostelApplication;
    }

    // -------------------------------------------------------
    // POST /api/student/upload-receipt
    // Auto-finds the student's current application (no ID needed)
    // -------------------------------------------------------
    async uploadReceipt(studentId: string, file: Express.Multer.File): Promise<{ receipt_url: string }> {
        const session = await this.getActiveSession();

        // Find the student's application for the active session
        const { data: app } = await supabaseAdmin
            .from('hostel_applications')
            .select('id, student_id, payment_verified')
            .eq('student_id', studentId)
            .eq('session_id', session.id)
            .single();

        if (!app) {
            throw AppError.notFound(ErrorCode.APP_NOT_FOUND, 'No application found for the current session. Apply first.');
        }

        if (app.payment_verified) {
            throw AppError.conflict(ErrorCode.PAY_ALREADY_VERIFIED, 'Payment is already verified. No need to re-upload.');
        }

        // Upload to Supabase Storage
        const ext = file.originalname.split('.').pop() || 'pdf';
        const filePath = `${studentId}/${app.id}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabaseAdmin.storage
            .from('receipts')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (uploadError) {
            throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to upload receipt');
        }

        const { data: urlData } = supabaseAdmin.storage
            .from('receipts')
            .getPublicUrl(filePath);

        // Update application
        await supabaseAdmin
            .from('hostel_applications')
            .update({ payment_receipt_url: urlData.publicUrl })
            .eq('id', app.id);

        return { receipt_url: urlData.publicUrl };
    }

    // -------------------------------------------------------
    // GET /api/student/status
    // Computed status from DB — the single source of truth
    // -------------------------------------------------------
    async getStatus(studentId: string): Promise<StudentStatus> {
        const session = await this.getActiveSessionOrNull();

        if (!session) {
            return { status: 'NO_APPLICATION', session: null, application: null, allocation: null };
        }

        // Get application with hostel names
        const { data: app } = await supabaseAdmin
            .from('hostel_applications')
            .select(`
        id, application_date, status, payment_receipt_url,
        payment_verified, payment_verified_at,
        first_choice:hostels!hostel_applications_first_choice_hostel_id_fkey(id, name),
        second_choice:hostels!hostel_applications_second_choice_hostel_id_fkey(id, name),
        third_choice:hostels!hostel_applications_third_choice_hostel_id_fkey(id, name)
      `)
            .eq('student_id', studentId)
            .eq('session_id', session.id)
            .maybeSingle();

        if (!app) {
            return { status: 'NO_APPLICATION', session: { id: session.id, name: session.name }, application: null, allocation: null };
        }

        // Check for allocation
        const { data: allocation } = await supabaseAdmin
            .from('allocations')
            .select(`
        bed_space_number, allocation_date,
        hostel:hostels(name),
        room:rooms(room_number, floor_number)
      `)
            .eq('student_id', studentId)
            .eq('session_id', session.id)
            .in('status', ['active', 'checked_in'])
            .maybeSingle();

        // Compute status from DB state
        const computedStatus = this.computeStatus(app, allocation);

        return {
            status: computedStatus,
            session: { id: session.id, name: session.name },
            application: {
                id: app.id,
                application_date: app.application_date,
                first_choice: app.first_choice as any,
                second_choice: app.second_choice as any,
                third_choice: app.third_choice as any,
                payment_receipt_uploaded: !!app.payment_receipt_url,
                payment_verified: app.payment_verified,
                payment_verified_at: app.payment_verified_at,
            },
            allocation: allocation
                ? {
                    hostel_name: (allocation as any).hostel.name,
                    room_number: (allocation as any).room.room_number,
                    floor_number: (allocation as any).room.floor_number,
                    bed_space_number: allocation.bed_space_number,
                    allocation_date: allocation.allocation_date,
                }
                : null,
        };
    }

    // -------------------------------------------------------
    // GET /api/student/allocation (read-only)
    // -------------------------------------------------------
    async getAllocation(studentId: string): Promise<unknown> {
        const session = await this.getActiveSession();

        const { data: allocation, error } = await supabaseAdmin
            .from('allocations')
            .select(`
        id, bed_space_number, allocation_date, allocation_type, status,
        room:rooms(id, room_number, floor_number, capacity, current_occupancy, room_type),
        hostel:hostels(id, name, gender)
      `)
            .eq('student_id', studentId)
            .eq('session_id', session.id)
            .in('status', ['active', 'checked_in'])
            .single();

        if (error || !allocation) {
            throw AppError.notFound(ErrorCode.ALLOC_NOT_FOUND, 'No allocation found for this session');
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
            .neq('student_id', studentId);

        return {
            ...allocation,
            roommates: (roommates || []).map((r: any) => ({
                name: `${r.student.first_name} ${r.student.last_name}`,
                matric_number: r.student.matric_number,
                department: r.student.department,
                level: r.student.level,
                bed_space_number: r.bed_space_number,
            })),
        };
    }

    // -------------------------------------------------------
    // PUBLIC: GET /api/public/application-status
    // Lookup by matric number + surname (no auth)
    // -------------------------------------------------------
    async getPublicStatus(matricNumber: string, surname: string): Promise<StudentStatus> {
        // Find student by matric + surname
        const { data: student } = await supabaseAdmin
            .from('profiles')
            .select('id, last_name')
            .eq('matric_number', matricNumber)
            .is('deleted_at', null)
            .single();

        if (!student || student.last_name.toLowerCase() !== surname.toLowerCase()) {
            throw AppError.notFound(ErrorCode.NOT_FOUND, 'No student found. Verify your matric number and surname.');
        }

        // Reuse the same status computation
        return this.getStatus(student.id);
    }

    // -------------------------------------------------------
    // PRIVATE HELPERS
    // -------------------------------------------------------
    private computeStatus(app: any, allocation: any): ComputedStatus {
        // Priority: allocation > ballot result > payment > submission
        if (allocation) return 'ALLOCATED';
        if (app.status === 'rejected') return 'REJECTED';
        if (app.status === 'not_allocated') return 'NOT_ALLOCATED';
        if (app.status === 'balloted') return 'BALLOTED';
        if (app.payment_verified) return 'VERIFIED';
        if (app.payment_receipt_url) return 'AWAITING_VERIFICATION';
        return 'SUBMITTED';
    }

    private async getActiveSession(): Promise<any> {
        const { data: session } = await supabaseAdmin
            .from('academic_sessions')
            .select('*')
            .eq('is_active', true)
            .single();

        if (!session) {
            throw AppError.badRequest(ErrorCode.SESSION_NOT_ACTIVE, 'No active academic session');
        }
        return session;
    }

    private async getActiveSessionOrNull(): Promise<any> {
        const { data: session } = await supabaseAdmin
            .from('academic_sessions')
            .select('id, name')
            .eq('is_active', true)
            .maybeSingle();
        return session;
    }
}

export const studentService = new StudentService();
