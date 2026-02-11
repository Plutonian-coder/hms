// ============================================================
// Types — YABATECH HMS Backend
// ============================================================
import { Request } from 'express';

// ---------- Enums ----------
export type UserRole = 'student' | 'warden' | 'admin';
export type Gender = 'male' | 'female';
export type StudentLevel = 100 | 200 | 300 | 400;
export type ApplicationStatus = 'pending' | 'payment_verified' | 'balloted' | 'allocated' | 'not_allocated' | 'rejected';
export type AllocationStatus = 'active' | 'checked_in' | 'checked_out' | 'revoked';
export type AllocationType = 'ballot' | 'manual';
export type RoomType = 'standard' | 'executive';
export type BedSpaceStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type CheckAction = 'check_in' | 'check_out';
export type BallotRunStatus = 'running' | 'completed' | 'approved' | 'rejected';

// ---------- Database Entities ----------
export interface Profile {
    id: string;
    matric_number: string | null;
    first_name: string;
    last_name: string;
    email: string;
    gender: Gender;
    level: StudentLevel | null;
    department: string | null;
    phone: string | null;
    photo_url: string | null;
    next_of_kin_name: string | null;
    next_of_kin_phone: string | null;
    next_of_kin_relationship: string | null;
    role: UserRole;
    is_eligible: boolean;
    is_active: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AcademicSession {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    application_start_date: string;
    application_end_date: string;
    ballot_date: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Hostel {
    id: string;
    name: string;
    gender: Gender;
    total_capacity: number;
    current_occupancy: number;
    description: string | null;
    is_active: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Room {
    id: string;
    hostel_id: string;
    room_number: string;
    floor_number: number;
    capacity: number;
    current_occupancy: number;
    room_type: RoomType;
    is_available: boolean;
    notes: string | null;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface BedSpace {
    id: string;
    room_id: string;
    bed_number: number;
    status: BedSpaceStatus;
    created_at: string;
    updated_at: string;
}

export interface HostelApplication {
    id: string;
    student_id: string;
    session_id: string;
    application_date: string;
    first_choice_hostel_id: string | null;
    second_choice_hostel_id: string | null;
    third_choice_hostel_id: string | null;
    payment_receipt_url: string | null;
    payment_verified: boolean;
    payment_verified_by: string | null;
    payment_verified_at: string | null;
    priority_score: number | null;
    ballot_run_id: string | null;
    status: ApplicationStatus;
    created_at: string;
    updated_at: string;
}

export interface Allocation {
    id: string;
    student_id: string;
    application_id: string;
    hostel_id: string;
    room_id: string;
    bed_space_id: string | null;
    session_id: string;
    bed_space_number: number;
    allocation_date: string;
    allocation_type: AllocationType;
    allocated_by: string | null;
    reason: string | null;
    status: AllocationStatus;
    created_at: string;
    updated_at: string;
}

export interface BallotConfig {
    id: string;
    session_id: string;
    payment_weight: number;
    category_weight: number;
    level_weight: number;
    fresh_student_score: number;
    final_year_score: number;
    level_300_score: number;
    level_200_score: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface BallotRun {
    id: string;
    session_id: string;
    config_id: string;
    total_applicants: number;
    total_verified: number;
    total_spaces: number;
    total_allocated: number;
    total_unallocated: number;
    config_snapshot: Record<string, unknown>;
    status: BallotRunStatus;
    run_at: string;
    run_by: string;
    approved_at: string | null;
    approved_by: string | null;
    created_at: string;
}

export interface WardenAssignment {
    id: string;
    warden_id: string;
    hostel_id: string;
    assigned_at: string;
    assigned_by: string;
    is_active: boolean;
}

export interface CheckInOut {
    id: string;
    allocation_id: string;
    student_id: string;
    action: CheckAction;
    performed_by: string;
    performed_at: string;
    notes: string | null;
}

export interface AuditLog {
    id: string;
    user_id: string | null;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    reason: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
}

// ---------- Express Extensions ----------
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        profile: Profile;
        accessToken: string;
    };
}

// ---------- API Responses ----------
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
        timestamp: string;
    };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
