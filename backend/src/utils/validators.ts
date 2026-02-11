// ============================================================
// Zod Validation Schemas
// ============================================================
import { z } from 'zod';

// ---------- Matric number format ----------
// e.g. F/ND/23/3210137 or YABATECH/2024/ND/CSC/001
export const matricNumberSchema = z
    .string()
    .min(5, 'Matric number must be at least 5 characters')
    .max(50, 'Matric number too long')
    .refine((val) => /^[\w\/.-]+$/i.test(val), {
        message: 'Invalid chars. Only letters, numbers, /, . and - allowed',
    });

// ---------- Auth ----------
// ---------- Auth ----------
export const registerSchema = z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    matric_number: matricNumberSchema,
    gender: z.enum(['male', 'female']),
    level: z.coerce.number().refine(v => [100, 200, 300, 400].includes(v), 'Level must be 100, 200, 300 or 400'),
    department: z.string().min(1).max(100),
    phone: z
        .string()
        .regex(/^(\+234|0)[789]\d{9}$/, 'Invalid Nigerian phone number')
        .optional(),
    // Email and Password are now optional (generated server-side for students)
    email: z.string().email().optional(),
    password: z.string().optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const studentLoginSchema = z.object({
    matric_number: matricNumberSchema,
    surname: z.string().min(1, 'Surname is required'),
});

// ---------- Hostel Application ----------
export const createApplicationSchema = z.object({
    first_choice_hostel_id: z.string().uuid('Invalid hostel ID'),
    second_choice_hostel_id: z.string().uuid('Invalid hostel ID').optional(),
    third_choice_hostel_id: z.string().uuid('Invalid hostel ID').optional(),
});

// ---------- Payment Verification ----------
export const verifyPaymentSchema = z.object({
    application_id: z.string().uuid(),
    verified: z.boolean(),
    notes: z.string().optional(),
});

// ---------- Ballot Config ----------
export const ballotConfigSchema = z.object({
    session_id: z.string().uuid(),
    payment_weight: z.number().min(0).max(1).default(0.50),
    category_weight: z.number().min(0).max(1).default(0.30),
    level_weight: z.number().min(0).max(1).default(0.20),
    fresh_student_score: z.number().int().min(0).max(100).default(100),
    final_year_score: z.number().int().min(0).max(100).default(90),
    level_300_score: z.number().int().min(0).max(100).default(70),
    level_200_score: z.number().int().min(0).max(100).default(60),
}).refine(
    data => Math.abs(data.payment_weight + data.category_weight + data.level_weight - 1.0) < 0.001,
    { message: 'Weights must sum to 1.0' }
);

// ---------- Run Ballot ----------
export const runBallotSchema = z.object({
    session_id: z.string().uuid(),
    confirm: z.literal(true, { errorMap: () => ({ message: 'You must set confirm to true to run the ballot' }) }),
});

// ---------- Approve Ballot ----------
export const approveBallotSchema = z.object({
    approved: z.boolean(),
});

// ---------- Manual Allocation ----------
export const manualAllocationSchema = z.object({
    student_id: z.string().uuid(),
    room_id: z.string().uuid(),
    session_id: z.string().uuid(),
    bed_space_number: z.number().int().min(1),
    reason: z.string().min(1, 'Reason is required for manual allocation'),
});

// ---------- Hostel CRUD ----------
export const createHostelSchema = z.object({
    name: z.string().min(1).max(100),
    gender: z.enum(['male', 'female']),
    description: z.string().optional(),
});

export const updateHostelSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    gender: z.enum(['male', 'female']).optional(),
    description: z.string().optional(),
    is_active: z.boolean().optional(),
});

// ---------- Room CRUD ----------
export const createRoomSchema = z.object({
    room_number: z.string().min(1).max(20),
    floor_number: z.number().int().min(0).default(1),
    capacity: z.number().int().min(1).max(20),
    room_type: z.enum(['standard', 'executive']).default('standard'),
});

export const updateRoomSchema = z.object({
    room_number: z.string().min(1).max(20).optional(),
    floor_number: z.number().int().min(0).optional(),
    capacity: z.number().int().min(1).max(20).optional(),
    room_type: z.enum(['standard', 'executive']).optional(),
    is_available: z.boolean().optional(),
    notes: z.string().optional(),
});

// ---------- Check-in / Check-out ----------
export const checkInOutSchema = z.object({
    allocation_id: z.string().uuid(),
    notes: z.string().optional(),
});

// ---------- Session CRUD ----------
export const createSessionSchema = z.object({
    name: z.string().min(1).max(20),
    start_date: z.string().refine(v => !isNaN(Date.parse(v)), 'Invalid date'),
    end_date: z.string().refine(v => !isNaN(Date.parse(v)), 'Invalid date'),
    application_start_date: z.string().refine(v => !isNaN(Date.parse(v)), 'Invalid date'),
    application_end_date: z.string().refine(v => !isNaN(Date.parse(v)), 'Invalid date'),
    ballot_date: z.string().refine(v => !isNaN(Date.parse(v)), 'Invalid date').optional(),
    is_active: z.boolean().default(false),
});

// ---------- Warden Assignment ----------
export const wardenAssignmentSchema = z.object({
    warden_id: z.string().uuid(),
    hostel_id: z.string().uuid(),
});

// ---------- Bulk Auto-Assign ----------
export const bulkAutoAssignSchema = z.object({
    student_ids: z.array(z.string().uuid()).min(1, 'At least one student ID required'),
    session_id: z.string().uuid().optional(),
    allocation_mode: z.enum(['priority_based', 'random']).default('priority_based'),
});

// ---------- Pagination ----------
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
