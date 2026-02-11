export type UserRole = "student" | "warden" | "admin";

export interface Profile {
  id: string;
  matric_number: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: "male" | "female";
  level: number;
  department: string;
  phone?: string;
  photo_url?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
  role: UserRole;
  is_eligible: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AcademicSession {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  application_start_date: string;
  application_end_date: string;
  ballot_date?: string;
  is_active: boolean;
}

export interface Hostel {
  id: string;
  name: string;
  gender: "male" | "female";
  total_capacity: number;
  current_occupancy: number;
  description?: string;
  is_active: boolean;
}

export interface Room {
  id: string;
  hostel_id: string;
  room_number: string;
  floor_number?: number;
  capacity: number;
  current_occupancy: number;
  room_type: string;
  is_available: boolean;
  notes?: string;
  hostel?: Hostel;
}

export interface BedSpace {
  id: string;
  room_id: string;
  bed_number: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
}

export type ApplicationStatus =
  | "pending"
  | "payment_verified"
  | "balloted"
  | "allocated"
  | "not_allocated"
  | "rejected";

export interface HostelApplication {
  id: string;
  student_id: string;
  session_id: string;
  application_date: string;
  first_choice_hostel_id?: string;
  second_choice_hostel_id?: string;
  third_choice_hostel_id?: string;
  payment_verified: boolean;
  payment_verified_at?: string;
  payment_receipt_url?: string;
  priority_score?: number;
  status: ApplicationStatus;
  student?: Profile;
  first_choice_hostel?: Hostel;
  second_choice_hostel?: Hostel;
  third_choice_hostel?: Hostel;
}

export interface Allocation {
  id: string;
  student_id: string;
  application_id: string;
  hostel_id: string;
  room_id: string;
  bed_space_id?: string;
  session_id: string;
  bed_space_number: number;
  allocation_date: string;
  allocation_type: "ballot" | "manual";
  allocated_by?: string;
  status: "active" | "checked_in" | "checked_out" | "revoked";
  student?: Profile;
  room?: Room;
  hostel?: Hostel;
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
}

export interface BallotRun {
  id: string;
  session_id: string;
  total_applicants: number;
  total_verified: number;
  total_spaces: number;
  total_allocated: number;
  status: "running" | "completed" | "approved" | "rejected";
  run_at: string;
}

export interface WardenAssignment {
  id: string;
  warden_id: string;
  hostel_id: string;
  is_active: boolean;
  warden?: Profile;
  hostel?: Hostel;
}

export interface DashboardStats {
  total_students: number;
  total_applications: number;
  total_allocated: number;
  total_hostels: number;
  total_rooms: number;
  total_capacity: number;
  total_occupancy: number;
  occupancy_rate: number;
  payment_verified_count: number;
  pending_payment_count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}
