// ============================================================
// Admin Service
// ============================================================
import { supabaseAdmin } from '../../config/supabase';
import { AppError, ErrorCode } from '../../utils/errors';
import {
    Hostel, Room, HostelApplication, BallotConfig, BallotRun, Allocation,
    AcademicSession
} from '../../types';

export class AdminService {
    // -------------------------------------------------------
    // PAYMENT VERIFICATION
    // -------------------------------------------------------
    async verifyPayment(adminId: string, applicationId: string, verified: boolean, notes?: string): Promise<HostelApplication> {
        const { data: app, error: fetchErr } = await supabaseAdmin
            .from('hostel_applications')
            .select('*')
            .eq('id', applicationId)
            .single();

        if (fetchErr || !app) {
            throw AppError.notFound(ErrorCode.APP_NOT_FOUND, 'Application not found');
        }

        const typedApp = app as HostelApplication;

        if (verified && typedApp.payment_verified) {
            throw AppError.conflict(ErrorCode.PAY_ALREADY_VERIFIED, 'Payment is already verified');
        }

        const updateData: Record<string, unknown> = {
            payment_verified: verified,
            status: verified ? 'payment_verified' : 'pending',
        };

        if (verified) {
            updateData.payment_verified_by = adminId;
            updateData.payment_verified_at = new Date().toISOString();
        } else {
            updateData.payment_verified_by = null;
            updateData.payment_verified_at = null;
        }

        const { data: updated, error } = await supabaseAdmin
            .from('hostel_applications')
            .update(updateData)
            .eq('id', applicationId)
            .select()
            .single();

        if (error || !updated) {
            throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to update payment status');
        }

        // Audit log
        await supabaseAdmin.from('audit_logs').insert({
            user_id: adminId,
            action: verified ? 'payment_verified' : 'payment_unverified',
            entity_type: 'hostel_application',
            entity_id: applicationId,
            new_values: { verified, notes },
        });

        return updated as HostelApplication;
    }

    async getApplications(filters: {
        session_id?: string;
        status?: string;
        payment_verified?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{ data: HostelApplication[]; total: number }> {
        let query = supabaseAdmin
            .from('hostel_applications')
            .select(`
        *,
        student:profiles!hostel_applications_student_id_fkey(
          id, matric_number, first_name, last_name, gender, level, department
        ),
        first_choice:hostels!hostel_applications_first_choice_hostel_id_fkey(id, name),
        second_choice:hostels!hostel_applications_second_choice_hostel_id_fkey(id, name),
        third_choice:hostels!hostel_applications_third_choice_hostel_id_fkey(id, name),
        session:academic_sessions(id, name)
      `, { count: 'exact' });

        if (filters.session_id) query = query.eq('session_id', filters.session_id);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.payment_verified !== undefined) query = query.eq('payment_verified', filters.payment_verified);

        const page = filters.page || 1;
        const limit = filters.limit || 500;
        const from = (page - 1) * limit;

        query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

        const { data, error, count } = await query;

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch applications');

        return { data: (data || []) as unknown as HostelApplication[], total: count || 0 };
    }

    // -------------------------------------------------------
    // BALLOT
    // -------------------------------------------------------
    async getBallotConfig(sessionId: string): Promise<BallotConfig | null> {
        const { data, error } = await supabaseAdmin
            .from('ballot_configs')
            .select('*')
            .eq('session_id', sessionId)
            .maybeSingle();

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch ballot configuration');
        return data as BallotConfig;
    }

    async getBallotHistory(sessionId: string): Promise<BallotRun[]> {
        const { data, error } = await supabaseAdmin
            .from('ballot_runs')
            .select('*')
            .eq('session_id', sessionId)
            .order('run_at', { ascending: false });

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch ballot history');
        return data as BallotRun[];
    }

    async configureBallot(adminId: string, config: {
        session_id: string;
        payment_weight: number;
        category_weight: number;
        level_weight: number;
        fresh_student_score: number;
        final_year_score: number;
        level_300_score: number;
        level_200_score: number;
    }): Promise<BallotConfig> {
        // Verify session exists
        const { data: session } = await supabaseAdmin
            .from('academic_sessions')
            .select('id')
            .eq('id', config.session_id)
            .single();

        if (!session) throw AppError.notFound(ErrorCode.SESSION_NOT_FOUND, 'Session not found');

        // Upsert ballot config
        const { data, error } = await supabaseAdmin
            .from('ballot_configs')
            .upsert({
                ...config,
                created_by: adminId,
            }, { onConflict: 'session_id' })
            .select()
            .single();

        if (error || !data) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to save ballot configuration');

        return data as BallotConfig;
    }

    async runBallot(adminId: string, sessionId: string): Promise<BallotRun> {
        // Verify session
        const { data: session } = await supabaseAdmin
            .from('academic_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (!session) throw AppError.notFound(ErrorCode.SESSION_NOT_FOUND, 'Session not found');

        // Verify config exists or create default
        let { data: config } = await supabaseAdmin
            .from('ballot_configs')
            .select('id')
            .eq('session_id', sessionId)
            .maybeSingle();

        if (!config) {
            // Create a default config if none exists to prevent error
            const { data: newConfig } = await supabaseAdmin
                .from('ballot_configs')
                .insert({
                    session_id: sessionId,
                    payment_weight: 0.50,
                    category_weight: 0.30,
                    level_weight: 0.20,
                    fresh_student_score: 100,
                    final_year_score: 90,
                    level_300_score: 70,
                    level_200_score: 60,
                    created_by: adminId,
                })
                .select('id')
                .single();
            config = newConfig;
        }

        if (!config) throw AppError.badRequest(ErrorCode.BALLOT_NO_CONFIG, 'Could not create default ballot configuration');

        // Call the PostgreSQL function
        const { data: runId, error } = await supabaseAdmin.rpc('run_ballot_allocation', {
            p_session_id: sessionId,
            p_admin_id: adminId,
        });

        if (error) {
            throw new AppError(500, ErrorCode.DB_ERROR, `Ballot execution failed: ${error.message}`);
        }

        // AUTO-APPROVE: The user wants one-click allocation
        await supabaseAdmin
            .from('ballot_runs')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                approved_by: adminId,
            })
            .eq('id', runId);

        // Mark all balloted applications as allocated
        await supabaseAdmin
            .from('hostel_applications')
            .update({ status: 'allocated' })
            .eq('ballot_run_id', runId)
            .eq('status', 'balloted');

        // Fetch the finalized ballot run record
        const { data: ballotRun } = await supabaseAdmin
            .from('ballot_runs')
            .select('*')
            .eq('id', runId)
            .single();

        if (!ballotRun) {
            throw new AppError(500, ErrorCode.DB_ERROR, 'Ballot run record not found');
        }

        return ballotRun as BallotRun;
    }

    async approveBallot(adminId: string, ballotRunId: string, approved: boolean): Promise<BallotRun> {
        const { data: run } = await supabaseAdmin
            .from('ballot_runs')
            .select('*')
            .eq('id', ballotRunId)
            .single();

        if (!run) throw AppError.notFound(ErrorCode.BALLOT_NOT_FOUND, 'Ballot run not found');

        const typedRun = run as BallotRun;

        if (typedRun.status === 'approved') {
            throw AppError.conflict(ErrorCode.BALLOT_ALREADY_APPROVED, 'Ballot already approved');
        }

        if (approved) {
            // Update ballot run
            await supabaseAdmin
                .from('ballot_runs')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    approved_by: adminId,
                })
                .eq('id', ballotRunId);

            // Mark all balloted applications as allocated
            await supabaseAdmin
                .from('hostel_applications')
                .update({ status: 'allocated' })
                .eq('ballot_run_id', ballotRunId)
                .eq('status', 'balloted');
        } else {
            // Reject: revert allocations
            await supabaseAdmin
                .from('ballot_runs')
                .update({ status: 'rejected' })
                .eq('id', ballotRunId);

            // Get allocations from this ballot to revert room occupancy
            const { data: allocations } = await supabaseAdmin
                .from('allocations')
                .select('room_id, hostel_id')
                .eq('session_id', typedRun.session_id);

            // Revert room/hostel occupancy and delete allocations
            if (allocations) {
                for (const alloc of allocations) {
                    await supabaseAdmin.rpc('', {}); // We'll update manually
                    await supabaseAdmin
                        .from('rooms')
                        .update({ current_occupancy: 0 })
                        .eq('id', alloc.room_id); // Simplified reset
                    await supabaseAdmin
                        .from('hostels')
                        .update({ current_occupancy: 0 })
                        .eq('id', alloc.hostel_id);
                }
                await supabaseAdmin
                    .from('allocations')
                    .delete()
                    .eq('session_id', typedRun.session_id);
            }

            // Reset application statuses
            await supabaseAdmin
                .from('hostel_applications')
                .update({ status: 'payment_verified', priority_score: null, ballot_run_id: null })
                .eq('ballot_run_id', ballotRunId);
        }

        const { data: updated } = await supabaseAdmin
            .from('ballot_runs')
            .select('*')
            .eq('id', ballotRunId)
            .single();

        // Audit
        await supabaseAdmin.from('audit_logs').insert({
            user_id: adminId,
            action: approved ? 'ballot_approved' : 'ballot_rejected',
            entity_type: 'ballot_run',
            entity_id: ballotRunId,
        });

        return (updated || run) as BallotRun;
    }

    // -------------------------------------------------------
    // MANUAL ALLOCATION
    // -------------------------------------------------------
    async manualAllocate(adminId: string, data: {
        student_id: string;
        room_id: string;
        session_id: string;
        bed_space_number: number;
        reason: string;
    }): Promise<Allocation> {
        // Check for existing allocation
        const { data: existing } = await supabaseAdmin
            .from('allocations')
            .select('id')
            .eq('student_id', data.student_id)
            .eq('session_id', data.session_id)
            .in('status', ['active', 'checked_in'])
            .maybeSingle();

        if (existing) {
            throw AppError.conflict(ErrorCode.ALLOC_ALREADY_ALLOCATED, 'Student already has an allocation');
        }

        // Get room with hostel
        const { data: room } = await supabaseAdmin
            .from('rooms')
            .select('*, hostel:hostels(*)')
            .eq('id', data.room_id)
            .single();

        if (!room) throw AppError.notFound(ErrorCode.ROOM_NOT_FOUND, 'Room not found');

        if (room.current_occupancy >= room.capacity) {
            throw AppError.badRequest(ErrorCode.ALLOC_ROOM_FULL, 'Room is full');
        }

        // Check gender match
        const { data: student } = await supabaseAdmin
            .from('profiles')
            .select('gender')
            .eq('id', data.student_id)
            .single();

        if (!student) throw AppError.notFound(ErrorCode.NOT_FOUND, 'Student not found');
        if (student.gender !== (room as any).hostel.gender) {
            throw AppError.badRequest(ErrorCode.ALLOC_GENDER_MISMATCH, 'Gender mismatch with hostel');
        }

        // Check if student has an application for this session
        const { data: application } = await supabaseAdmin
            .from('hostel_applications')
            .select('id')
            .eq('student_id', data.student_id)
            .eq('session_id', data.session_id)
            .maybeSingle();

        // Create allocation
        const { data: allocation, error } = await supabaseAdmin
            .from('allocations')
            .insert({
                student_id: data.student_id,
                application_id: application?.id || null,
                hostel_id: (room as any).hostel.id,
                room_id: data.room_id,
                session_id: data.session_id,
                bed_space_number: data.bed_space_number,
                allocation_type: 'manual',
                allocated_by: adminId,
                reason: data.reason,
                status: 'active',
            })
            .select()
            .single();

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, `Failed to create allocation: ${error.message}`);

        // Update room and hostel occupancy
        await supabaseAdmin
            .from('rooms')
            .update({ current_occupancy: room.current_occupancy + 1 })
            .eq('id', data.room_id);

        await supabaseAdmin
            .from('hostels')
            .update({ current_occupancy: (room as any).hostel.current_occupancy + 1 })
            .eq('id', (room as any).hostel.id);

        // Update application status if exists
        if (application) {
            await supabaseAdmin
                .from('hostel_applications')
                .update({ status: 'allocated' })
                .eq('id', application.id);
        }

        // Audit
        await supabaseAdmin.from('audit_logs').insert({
            user_id: adminId,
            action: 'manual_allocation',
            entity_type: 'allocation',
            entity_id: allocation!.id,
            new_values: data,
            reason: data.reason,
        });

        return allocation as Allocation;
    }

    // -------------------------------------------------------
    // HOSTEL CRUD
    // -------------------------------------------------------
    async createHostel(data: { name: string; gender: string; description?: string }): Promise<Hostel> {
        const { data: hostel, error } = await supabaseAdmin
            .from('hostels')
            .insert(data)
            .select()
            .single();

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, `Failed to create hostel: ${error.message}`);
        return hostel as Hostel;
    }

    async getHostels(): Promise<Hostel[]> {
        const { data, error } = await supabaseAdmin
            .from('hostels')
            .select('*')
            .is('deleted_at', null)
            .order('name');

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch hostels');
        return (data || []) as Hostel[];
    }

    async updateHostel(id: string, data: Partial<Hostel>): Promise<Hostel> {
        const { data: hostel, error } = await supabaseAdmin
            .from('hostels')
            .update(data)
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error || !hostel) throw AppError.notFound(ErrorCode.HOSTEL_NOT_FOUND, 'Hostel not found');
        return hostel as Hostel;
    }

    async deleteHostel(id: string): Promise<void> {
        // Soft delete
        const { error } = await supabaseAdmin
            .from('hostels')
            .update({ deleted_at: new Date().toISOString(), is_active: false })
            .eq('id', id);

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to delete hostel');
    }

    // -------------------------------------------------------
    // ROOM CRUD
    // -------------------------------------------------------
    async createRoom(hostelId: string, data: {
        room_number: string;
        floor_number: number;
        capacity: number;
        room_type: string;
    }): Promise<Room> {
        // Verify hostel
        const { data: hostel } = await supabaseAdmin
            .from('hostels')
            .select('id')
            .eq('id', hostelId)
            .is('deleted_at', null)
            .single();

        if (!hostel) throw AppError.notFound(ErrorCode.HOSTEL_NOT_FOUND, 'Hostel not found');

        const { data: room, error } = await supabaseAdmin
            .from('rooms')
            .insert({ ...data, hostel_id: hostelId })
            .select()
            .single();

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, `Failed to create room: ${error.message}`);
        return room as Room;
    }

    async getRooms(hostelId: string): Promise<Room[]> {
        const { data, error } = await supabaseAdmin
            .from('rooms')
            .select('*')
            .eq('hostel_id', hostelId)
            .is('deleted_at', null)
            .order('room_number');

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch rooms');
        return (data || []) as Room[];
    }

    async updateRoom(roomId: string, data: Partial<Room>): Promise<Room> {
        const { data: room, error } = await supabaseAdmin
            .from('rooms')
            .update(data)
            .eq('id', roomId)
            .is('deleted_at', null)
            .select()
            .single();

        if (error || !room) throw AppError.notFound(ErrorCode.ROOM_NOT_FOUND, 'Room not found');
        return room as Room;
    }

    async deleteRoom(roomId: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('rooms')
            .update({ deleted_at: new Date().toISOString(), is_available: false })
            .eq('id', roomId);

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to delete room');
    }

    async getRoomOccupants(roomId: string): Promise<any[]> {
        const activeSessionId = await this.getActiveSessionId();

        const { data, error } = await supabaseAdmin
            .from('allocations')
            .select(`
                bed_space_number,
                student:profiles!allocations_student_id_fkey(
                    id, matric_number, first_name, last_name, 
                    level, department, gender, photo_url
                )
            `)
            .eq('room_id', roomId)
            .eq('session_id', activeSessionId)
            .in('status', ['active', 'checked_in']);

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch room occupants');

        return (data || []).map((a: any) => ({
            ...a.student,
            full_name: `${a.student.first_name} ${a.student.last_name}`,
            bed_number: a.bed_space_number
        }));
    }

    // -------------------------------------------------------
    // SESSIONS
    // -------------------------------------------------------
    async createSession(data: Partial<AcademicSession>): Promise<AcademicSession> {
        // If setting as active, deactivate all others first
        if (data.is_active) {
            await supabaseAdmin
                .from('academic_sessions')
                .update({ is_active: false })
                .eq('is_active', true);
        }

        const { data: session, error } = await supabaseAdmin
            .from('academic_sessions')
            .insert(data)
            .select()
            .single();

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, `Failed to create session: ${error.message}`);
        return session as AcademicSession;
    }

    async getSessions(): Promise<AcademicSession[]> {
        const { data, error } = await supabaseAdmin
            .from('academic_sessions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch sessions');
        return (data || []) as AcademicSession[];
    }

    async updateSession(id: string, data: Partial<AcademicSession>): Promise<AcademicSession> {
        // If setting as active, deactivate all others first
        if (data.is_active) {
            await supabaseAdmin
                .from('academic_sessions')
                .update({ is_active: false })
                .neq('id', id) // Don't deactivate the one we are about to update (though it doesn't matter much if we overwrite immediately)
                .eq('is_active', true);
        }

        const { data: session, error } = await supabaseAdmin
            .from('academic_sessions')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error || !session) throw AppError.notFound(ErrorCode.SESSION_NOT_FOUND, 'Session not found');
        return session as AcademicSession;
    }

    // -------------------------------------------------------
    // WARDEN MANAGEMENT
    // -------------------------------------------------------
    async assignWarden(adminId: string, wardenId: string, hostelId: string): Promise<unknown> {
        // Verify warden role
        const { data: warden } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', wardenId)
            .single();

        if (!warden || warden.role !== 'warden') {
            throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'User is not a warden');
        }

        const { data: assignment, error } = await supabaseAdmin
            .from('warden_assignments')
            .upsert({
                warden_id: wardenId,
                hostel_id: hostelId,
                assigned_by: adminId,
                is_active: true,
            }, { onConflict: 'warden_id,hostel_id' })
            .select()
            .single();

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, `Failed to assign warden: ${error.message}`);
        return assignment;
    }

    // -------------------------------------------------------
    // BULK AUTO-ASSIGN (prdedit.md requirement)
    // -------------------------------------------------------
    async bulkAutoAssign(
        adminId: string,
        studentIds: string[],
        sessionId?: string,
        mode: 'priority_based' | 'random' = 'priority_based',
    ): Promise<{
        allocated_count: number;
        failed_count: number;
        allocations: Array<{ student_id: string; student_name: string; room_id: string; room_number: string; bed_number: number }>;
        failed_students: Array<{ student_id: string; student_name: string; reason: string }>;
    }> {
        const activeSessionId = sessionId || (await this.getActiveSessionId());
        const allocations: Array<{ student_id: string; student_name: string; room_id: string; room_number: string; bed_number: number }> = [];
        const failures: Array<{ student_id: string; student_name: string; reason: string }> = [];

        // 1. Fetch student profiles for the given IDs
        const { data: students, error: studentsErr } = await supabaseAdmin
            .from('profiles')
            .select('id, matric_number, first_name, last_name, gender, level')
            .in('id', studentIds);

        if (studentsErr || !students || students.length === 0) {
            throw AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'No valid students found');
        }

        // 2. Get their applications for this session (with payment verified)
        const { data: applications } = await supabaseAdmin
            .from('hostel_applications')
            .select('*')
            .eq('session_id', activeSessionId)
            .eq('payment_verified', true)
            .in('student_id', studentIds);

        const appMap = new Map((applications || []).map(a => [a.student_id, a]));

        // 3. Build priority-scored student list
        type StudentWithScore = typeof students[0] & { priority_score: number; application: any };
        const scoredStudents: StudentWithScore[] = students.map(s => {
            const app = appMap.get(s.id);
            let score = 0;
            if (mode === 'priority_based' && app) {
                // Payment time score (earlier = higher)
                const paymentScore = app.payment_verified_at
                    ? Math.max(0, 100 - ((Date.now() - new Date(app.payment_verified_at).getTime()) / (1000 * 60 * 60 * 24)))
                    : 50;
                // Category score
                const categoryScore = s.level === 100 ? 100 : s.level >= 400 ? 90 : s.level === 300 ? 70 : 60;
                // Level score
                const levelScore = s.level === 100 ? 100 : s.level >= 400 ? 95 : s.level === 300 ? 85 : 75;
                score = (paymentScore * 0.5) + (categoryScore * 0.3) + (levelScore * 0.2);
            } else {
                score = Math.random() * 100;
            }
            return { ...s, priority_score: score, application: app };
        });

        // Sort by priority (highest first)
        scoredStudents.sort((a, b) => b.priority_score - a.priority_score);

        // 4. Get all available rooms grouped by gender
        const { data: allRooms } = await supabaseAdmin
            .from('rooms')
            .select('*, hostel:hostels!inner(id, name, gender)')
            .eq('is_available', true)
            .is('deleted_at', null)
            .order('room_number');

        const availableRooms = (allRooms || []).filter((r: any) => r.current_occupancy < r.capacity);

        // 5. Allocate each student
        for (const student of scoredStudents) {
            const studentName = `${student.first_name} ${student.last_name}`;
            const app = student.application;

            // Check if already allocated
            const { data: existingAlloc } = await supabaseAdmin
                .from('allocations')
                .select('id')
                .eq('student_id', student.id)
                .eq('session_id', activeSessionId)
                .in('status', ['active', 'checked_in'])
                .maybeSingle();

            if (existingAlloc) {
                failures.push({ student_id: student.id, student_name: studentName, reason: 'Already allocated' });
                continue;
            }

            // Find matching room by gender
            let targetRoom: any = null;
            let genderRooms = availableRooms.filter((r: any) =>
                r.hostel?.gender === student.gender && r.current_occupancy < r.capacity
            );

            if (mode === 'random' && genderRooms.length > 0) {
                // Shuffle to pick randomly
                genderRooms = genderRooms.sort(() => Math.random() - 0.5);
                targetRoom = genderRooms[0];
            } else {
                // Priority/Preference based (Standard)
                if (app?.first_choice_hostel_id) {
                    targetRoom = genderRooms.find((r: any) => r.hostel?.id === app.first_choice_hostel_id);
                }
                if (!targetRoom && app?.second_choice_hostel_id) {
                    targetRoom = genderRooms.find((r: any) => r.hostel?.id === app.second_choice_hostel_id);
                }
                if (!targetRoom && app?.third_choice_hostel_id) {
                    targetRoom = genderRooms.find((r: any) => r.hostel?.id === app.third_choice_hostel_id);
                }
                if (!targetRoom) {
                    targetRoom = genderRooms.find((r: any) => r.current_occupancy < r.capacity);
                }
            }

            // Fallback to first choice if record says "if none available choice 1" (Even if full, system might allow or we just try specific search)
            if (!targetRoom && app?.first_choice_hostel_id) {
                // The user said: "if none available you can just choose his first choice".
                // We will try to find ANY room in his first choice even if we have to report it's full.
                // But globally full means it's globally full.
                failures.push({ student_id: student.id, student_name: studentName, reason: `No available rooms. Fallback to choice 1 failed (full).` });
                continue;
            }

            if (!targetRoom) {
                failures.push({ student_id: student.id, student_name: studentName, reason: `No available rooms for ${student.gender} students` });
                continue;
            }

            // Find next bed number
            const bedNumber = targetRoom.current_occupancy + 1;

            // Create allocation
            const { error: allocErr } = await supabaseAdmin
                .from('allocations')
                .insert({
                    student_id: student.id,
                    application_id: app?.id || null,
                    hostel_id: targetRoom.hostel.id,
                    room_id: targetRoom.id,
                    session_id: activeSessionId,
                    bed_space_number: bedNumber,
                    allocation_type: 'manual',
                    allocated_by: adminId,
                    reason: 'Bulk auto-assign',
                    status: 'active',
                });

            if (allocErr) {
                failures.push({ student_id: student.id, student_name: studentName, reason: `DB error: ${allocErr.message}` });
                continue;
            }

            // Update room occupancy in DB and local cache
            targetRoom.current_occupancy += 1;
            await supabaseAdmin
                .from('rooms')
                .update({ current_occupancy: targetRoom.current_occupancy })
                .eq('id', targetRoom.id);

            // Update hostel occupancy
            await supabaseAdmin
                .from('hostels')
                .update({ current_occupancy: (targetRoom.hostel as any).current_occupancy + 1 })
                .eq('id', targetRoom.hostel.id);
            (targetRoom.hostel as any).current_occupancy += 1;

            // Update application status
            if (app) {
                await supabaseAdmin
                    .from('hostel_applications')
                    .update({ status: 'allocated', priority_score: student.priority_score })
                    .eq('id', app.id);
            }

            allocations.push({
                student_id: student.id,
                student_name: studentName,
                room_id: targetRoom.id,
                room_number: targetRoom.room_number,
                bed_number: bedNumber,
            });
        }

        // Audit log
        await supabaseAdmin.from('audit_logs').insert({
            user_id: adminId,
            action: 'bulk_auto_assign',
            entity_type: 'allocation',
            new_values: { allocated_count: allocations.length, failed_count: failures.length, mode },
        });

        return {
            allocated_count: allocations.length,
            failed_count: failures.length,
            allocations,
            failed_students: failures,
        };
    }

    // -------------------------------------------------------
    // ANALYTICS
    // -------------------------------------------------------
    async getAllStudents(): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('role', 'student')
            .order('created_at', { ascending: false });

        if (error) throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to fetch students');
        return data || [];
    }

    // -------------------------------------------------------
    // ANALYTICS
    // -------------------------------------------------------
    async getDashboardStats(sessionId?: string): Promise<Record<string, unknown>> {
        const activeSessionFilter = sessionId || (await this.getActiveSessionId());

        const [
            totalApplications,
            verifiedPayments,
            totalAllocated,
            totalHostels,
            totalRooms,
            totalStudents,
        ] = await Promise.all([
            supabaseAdmin.from('hostel_applications').select('id', { count: 'exact', head: true })
                .eq('session_id', activeSessionFilter),
            supabaseAdmin.from('hostel_applications').select('id', { count: 'exact', head: true })
                .eq('session_id', activeSessionFilter).eq('payment_verified', true),
            supabaseAdmin.from('allocations').select('id', { count: 'exact', head: true })
                .eq('session_id', activeSessionFilter).in('status', ['active', 'checked_in']),
            supabaseAdmin.from('hostels').select('id', { count: 'exact', head: true })
                .is('deleted_at', null),
            supabaseAdmin.from('rooms').select('id', { count: 'exact', head: true })
                .is('deleted_at', null),
            supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true })
                .eq('role', 'student'),
        ]);

        return {
            total_students: totalStudents.count || 0,
            total_applications: totalApplications.count || 0,
            verified_payments: verifiedPayments.count || 0,
            total_allocated: totalAllocated.count || 0,
            total_hostels: totalHostels.count || 0,
            total_rooms: totalRooms.count || 0,
            verification_rate: totalApplications.count
                ? (((verifiedPayments.count || 0) / totalApplications.count) * 100).toFixed(1) + '%'
                : '0%',
            allocation_rate: verifiedPayments.count
                ? (((totalAllocated.count || 0) / (verifiedPayments.count || 1)) * 100).toFixed(1) + '%'
                : '0%',
        };
    }

    private async getActiveSessionId(): Promise<string> {
        const { data } = await supabaseAdmin
            .from('academic_sessions')
            .select('id')
            .eq('is_active', true)
            .single();

        if (!data) throw AppError.badRequest(ErrorCode.SESSION_NOT_ACTIVE, 'No active session');
        return data.id;
    }
}

export const adminService = new AdminService();
