# YABATECH Hostel Management System - Backend PRD
## Product Requirements Document v1.0

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Vision
A streamlined hostel management system for YABATECH that allows students to view their hostel allocation details by entering their matric number, while providing administrators with tools to manage allocations through a ballot system with payment-priority ranking.

### 1.2 Core Objectives
1. **Student Self-Service:** Students can check their allocation status (hostel, room, bed space, occupants)
2. **Payment Verification:** Admins verify student payments made to the school
3. **Fair Allocation:** Automated ballot system prioritizing students who paid earlier
4. **Efficient Management:** Wardens manage their assigned hostels and rooms
5. **Transparency:** All stakeholders can view allocation data relevant to their role

### 1.3 Key Differentiator
Unlike traditional systems, this platform uses a **payment-timestamp-based ballot system** where earlier payers get higher priority in the automated allocation lottery.

---

## 2. SCOPE DEFINITION

### 2.1 In Scope
✅ Student registration and profile management  
✅ Hostel and room inventory management  
✅ Payment verification by admin (students pay school directly)  
✅ Ballot system with payment priority ranking  
✅ Room allocation display (hostel, room, bed space, occupants)  
✅ Three-tier RBAC (Student, Warden, Admin)  
✅ Allocation history and audit trail  
✅ Basic reporting and analytics  

### 2.2 Out of Scope (Future Phases)
❌ Online payment processing (students pay school, not platform)  
❌ Hostel fee calculation  
❌ Mess/cafeteria management  
❌ Maintenance request system  
❌ Visitor management  
❌ Mobile apps (web-first approach)  
❌ Biometric check-in/out  

---

## 3. USER ROLES & PERMISSIONS

### 3.1 Role Hierarchy

```
┌─────────────────────────────────────┐
│           ADMIN                     │
│  (Super User - Full System Access)  │
└─────────────────────────────────────┘
              ▲
              │
              │
┌─────────────┴─────────────────┐
│                                │
│  WARDEN                        │
│  (Hostel-specific Management)  │
└────────────────────────────────┘
              ▲
              │
              │
┌─────────────┴─────────────────┐
│                                │
│  STUDENT                       │
│  (View Own Allocation)         │
└────────────────────────────────┘
```

### 3.2 Student Role Permissions

**CAN:**
- ✅ Register/login with matric number
- ✅ View own profile
- ✅ Update profile information (name, phone, photo)
- ✅ Apply for hostel accommodation
- ✅ Select hostel preferences (1st, 2nd, 3rd choice)
- ✅ View application status
- ✅ View ballot results and priority score
- ✅ View allocated hostel details (hostel name, room number, bed space, occupants)
- ✅ View payment status (verified/pending)
- ✅ Download allocation letter (if allocated)

**CANNOT:**
- ❌ View other students' allocations
- ❌ Modify payment status
- ❌ Change allocation after it's confirmed
- ❌ Access admin/warden dashboards

### 3.3 Warden Role Permissions

**CAN:**
- ✅ Login to warden dashboard
- ✅ View all students in assigned hostel(s)
- ✅ View room occupancy status
- ✅ View student profiles in their hostel
- ✅ Check students in/out (update occupancy status)
- ✅ View allocation list for their hostel
- ✅ Generate hostel-specific reports (occupancy, student list)
- ✅ Update room conditions/notes

**CANNOT:**
- ❌ Allocate/deallocate rooms (only admin)
- ❌ Verify payments
- ❌ Run ballot process
- ❌ Create/delete hostels or rooms
- ❌ Access other wardens' hostels (unless assigned)

### 3.4 Admin Role Permissions

**CAN (Full System Access):**
- ✅ Manage all hostels (create, edit, delete)
- ✅ Manage all rooms (create, edit, delete, set availability)
- ✅ Verify student payments (mark as paid/unpaid)
- ✅ Configure ballot parameters (weights, deadlines)
- ✅ Run ballot process
- ✅ Approve/reject allocations
- ✅ Manual allocation/reallocation (override)
- ✅ View all students, wardens, and data
- ✅ Assign wardens to hostels
- ✅ Generate system-wide reports
- ✅ Manage academic sessions
- ✅ View audit logs
- ✅ Export data (CSV, Excel)

**CANNOT:**
- ❌ Delete historical allocation data (soft deletes only)
- ❌ Modify ballot results after approval (audit trail protection)

---

## 4. CORE FUNCTIONAL REQUIREMENTS

### 4.1 Student Features

#### 4.1.1 Registration & Authentication
**FR-STU-001: Student Registration**
- Students register using matric number, email, and password
- System validates matric number format (e.g., YABATECH/2024/ND/CSC/001)
- Email verification required before first login
- Profile creation with: name, gender, level, department, phone, next of kin

**FR-STU-002: Student Login**
- Login with matric number OR email + password
- JWT token-based authentication via Supabase Auth
- Session management with automatic logout after inactivity

#### 4.1.2 Profile Management
**FR-STU-003: View/Edit Profile**
- View: matric number, name, gender, level, department, phone, email, photo
- Edit: phone, photo, next of kin details
- Cannot edit: matric number, gender, level (admin only)

**FR-STU-004: Upload Photo**
- Upload profile photo (max 2MB, JPEG/PNG)
- Photo stored in Supabase Storage
- Photo displayed in allocation letter

#### 4.1.3 Hostel Application
**FR-STU-005: Submit Application**
- Student applies for hostel accommodation during application period
- Selects up to 3 hostel preferences (priority order)
- Cannot apply if already allocated for current session
- Cannot apply if session application period is closed

**FR-STU-006: Payment Status**
- Students pay school directly (offline)
- View payment status in dashboard (Pending/Verified by Admin)
- Upload payment receipt/proof (optional)
- System records timestamp when admin marks payment as verified

#### 4.1.4 Ballot & Allocation
**FR-STU-007: View Ballot Status**
- View application status: Pending → Payment Verified → Balloted → Allocated/Not Allocated
- View priority score after ballot (transparency)
- View ranking position among applicants

**FR-STU-008: View Allocation Details**
- **Primary Feature (Supervisor's Requirement):**
  - Enter matric number → See allocation details:
    - Hostel name
    - Room number
    - Bed space number
    - Number of current occupants in room
    - List of roommates (names only)
- Download allocation letter (PDF)
- View allocation history (past sessions)

### 4.2 Warden Features

#### 4.2.1 Dashboard & Overview
**FR-WAR-001: Warden Dashboard**
- View assigned hostel(s) overview
- Total capacity vs current occupancy
- Available bed spaces
- Recent check-ins/check-outs

**FR-WAR-002: Room Management**
- View all rooms in assigned hostel(s)
- Filter by: floor, occupancy status, room type
- View room details: capacity, current occupants, bed space availability
- Add notes to rooms (e.g., "AC not working")

#### 4.2.3 Student Management
**FR-WAR-003: View Students**
- View all students allocated to their hostel(s)
- Search/filter by: name, matric number, room, level, department
- View student profiles (read-only)

**FR-WAR-004: Check-In/Out**
- Mark student as checked-in (occupancy++)
- Mark student as checked-out (occupancy--)
- Timestamp recorded for both actions
- View check-in/out history

#### 4.2.4 Reporting
**FR-WAR-005: Generate Reports**
- Occupancy report (by room, floor, hostel)
- Student list (with contact details)
- Check-in/out log
- Export to PDF/Excel

### 4.3 Admin Features

#### 4.3.1 Hostel & Room Management
**FR-ADM-001: Manage Hostels**
- Create hostel (name, gender, total capacity, description)
- Edit hostel details
- Soft delete hostel (mark as inactive)
- View all hostels with occupancy stats

**FR-ADM-002: Manage Rooms**
- Create room (hostel, room number, capacity, type, floor)
- Edit room details
- Set room availability (available/unavailable/under maintenance)
- Soft delete room
- Bulk room creation (e.g., create 50 rooms at once)

#### 4.3.2 Payment Verification
**FR-ADM-003: Verify Payments**
- View all student applications
- Filter by payment status (Pending/Verified)
- Mark payment as verified (records timestamp)
- Unmark payment (if error)
- View payment receipt uploaded by student
- Bulk payment verification (upload CSV with matric numbers)

#### 4.3.3 Ballot System
**FR-ADM-004: Configure Ballot**
- Set ballot parameters:
  - Payment weight (default: 50%)
  - Category weight (default: 30% - fresh/final year priority)
  - Level weight (default: 20%)
- Set application start/end dates
- Set ballot run date
- Configure priority for fresh students (100 level)
- Configure priority for final year students

**FR-ADM-005: Run Ballot**
- System calculates priority scores for all verified payments
- Algorithm:
  ```
  Priority Score = (Payment Time Score × 0.5) + 
                   (Category Score × 0.3) + 
                   (Level Score × 0.2)
  
  Payment Time Score = 100 - ((time_since_verification_start / total_application_period) × 100)
  Category Score = 100 (if fresh/final), 70 (if 300L), 60 (if 200L)
  Level Score = Based on academic level weighting
  ```
- Students ranked by priority score (descending)
- Allocation done based on:
  - Available bed spaces
  - Student preferences (1st, 2nd, 3rd choice)
  - Gender (male/female hostel separation)
  - Room capacity
- Generate allocation list
- Mark status as "Balloted - Pending Approval"

**FR-ADM-006: Approve Allocations**
- Review ballot results
- View allocation statistics
- Approve allocations (status → Allocated)
- Reject and re-run ballot (if issues found)
- Once approved, students can view their allocations

#### 4.3.4 Manual Allocation
**FR-ADM-007: Manual Override**
- Allocate student to specific room manually
- Deallocate student from room
- Swap students between rooms
- Reason required for manual actions (audit trail)

#### 4.3.5 User Management
**FR-ADM-008: Manage Wardens**
- Create warden accounts
- Assign wardens to specific hostels
- Edit warden details
- Deactivate warden accounts

**FR-ADM-009: Manage Students**
- View all students
- Edit student details (if errors)
- Mark student as eligible/ineligible for ballot
- View student application history

#### 4.3.6 Session Management
**FR-ADM-010: Academic Sessions**
- Create academic session (e.g., 2024/2025)
- Set session dates
- Set application period for each session
- Activate/deactivate sessions
- Only one active session at a time

#### 4.3.7 Analytics & Reporting
**FR-ADM-011: System Analytics**
- Dashboard with key metrics:
  - Total applications
  - Payment verification rate
  - Allocation success rate
  - Occupancy rate by hostel
  - Gender distribution
  - Level distribution
  - Department distribution
- Graphs/charts for visual representation

**FR-ADM-012: Generate Reports**
- Allocation report (all students)
- Unallocated students report
- Payment status report
- Occupancy report (all hostels)
- Audit log report
- Export to Excel/PDF

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 Technology Stack

#### Backend
- **Backend-as-a-Service:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **API Framework:** Supabase Auto-generated REST API + PostgreSQL Functions
- **Additional API Layer (Optional):** Next.js API Routes or NestJS (if complex business logic)
- **Authentication:** Supabase Auth (JWT-based)
- **Database:** PostgreSQL (via Supabase)
- **Storage:** Supabase Storage (for photos, receipts, PDFs)
- **Real-time:** Supabase Realtime (for live updates)

#### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand or React Context
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **PDF Generation:** react-pdf or jsPDF

#### DevOps
- **Hosting:** Vercel (frontend) + Supabase (backend)
- **Version Control:** Git + GitHub
- **CI/CD:** Vercel Auto-deployment

### 5.2 Why Supabase?

✅ **Pros:**
- Built-in authentication with RBAC (Row Level Security)
- Auto-generated REST API from database schema
- Built-in file storage
- Real-time subscriptions (live updates)
- PostgreSQL (powerful for complex queries/ranking)
- Free tier suitable for development
- Nigerian-friendly (good latency)
- Reduces backend development time by 60%

⚠️ **Considerations:**
- Complex business logic may need custom API layer
- Vendor lock-in (but can self-host if needed)
- Learning curve for RLS policies

---

## 6. DATABASE SCHEMA (Supabase PostgreSQL)

### 6.1 Core Tables

#### Table: `profiles` (extends Supabase auth.users)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  matric_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  level INTEGER NOT NULL CHECK (level IN (100, 200, 300, 400)),
  department VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  photo_url TEXT,
  next_of_kin_name VARCHAR(200),
  next_of_kin_phone VARCHAR(20),
  next_of_kin_relationship VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'warden', 'admin')),
  is_eligible BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_matric ON profiles(matric_number);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_level ON profiles(level);
```

#### Table: `academic_sessions`
```sql
CREATE TABLE academic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(20) NOT NULL UNIQUE, -- e.g., "2024/2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  application_start_date TIMESTAMPTZ NOT NULL,
  application_end_date TIMESTAMPTZ NOT NULL,
  ballot_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active session at a time (constraint)
CREATE UNIQUE INDEX idx_one_active_session ON academic_sessions(is_active) 
WHERE is_active = TRUE;
```

#### Table: `hostels`
```sql
CREATE TABLE hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  total_capacity INTEGER NOT NULL DEFAULT 0,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_occupancy CHECK (current_occupancy <= total_capacity)
);

CREATE INDEX idx_hostels_gender ON hostels(gender);
CREATE INDEX idx_hostels_active ON hostels(is_active);
```

#### Table: `rooms`
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  floor_number INTEGER,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  room_type VARCHAR(50) DEFAULT 'standard', -- standard, executive
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT, -- For wardens to add notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT check_room_occupancy CHECK (current_occupancy <= capacity),
  CONSTRAINT unique_room_per_hostel UNIQUE(hostel_id, room_number)
);

CREATE INDEX idx_rooms_hostel ON rooms(hostel_id);
CREATE INDEX idx_rooms_available ON rooms(is_available);
```

#### Table: `hostel_applications`
```sql
CREATE TABLE hostel_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  application_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Hostel preferences
  first_choice_hostel_id UUID REFERENCES hostels(id),
  second_choice_hostel_id UUID REFERENCES hostels(id),
  third_choice_hostel_id UUID REFERENCES hostels(id),
  
  -- Payment verification
  payment_verified BOOLEAN DEFAULT FALSE,
  payment_verified_by UUID REFERENCES profiles(id), -- Admin who verified
  payment_verified_at TIMESTAMPTZ, -- CRITICAL for priority calculation
  payment_receipt_url TEXT, -- Optional: student uploads receipt
  
  -- Ballot & allocation
  priority_score DECIMAL(5,2), -- Calculated during ballot
  status VARCHAR(50) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'payment_verified', 'balloted', 'allocated', 'not_allocated', 'rejected')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One application per student per session
  CONSTRAINT unique_student_session UNIQUE(student_id, session_id)
);

CREATE INDEX idx_applications_student ON hostel_applications(student_id);
CREATE INDEX idx_applications_session ON hostel_applications(session_id);
CREATE INDEX idx_applications_status ON hostel_applications(status);
CREATE INDEX idx_applications_payment_time ON hostel_applications(payment_verified_at);
CREATE INDEX idx_applications_priority ON hostel_applications(priority_score DESC);
```

#### Table: `allocations`
```sql
CREATE TABLE allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES hostel_applications(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  
  bed_space_number INTEGER NOT NULL, -- e.g., 1, 2, 3, 4
  allocation_date TIMESTAMPTZ DEFAULT NOW(),
  allocation_type VARCHAR(20) DEFAULT 'ballot' CHECK (allocation_type IN ('ballot', 'manual')),
  allocated_by UUID REFERENCES profiles(id), -- Admin who allocated (if manual)
  
  check_in_date TIMESTAMPTZ,
  check_in_by UUID REFERENCES profiles(id), -- Warden who checked in
  check_out_date TIMESTAMPTZ,
  check_out_by UUID REFERENCES profiles(id), -- Warden who checked out
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'checked_in', 'checked_out', 'revoked')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One student per bed space per room per session
  CONSTRAINT unique_bed_space UNIQUE(room_id, bed_space_number, session_id),
  -- One allocation per student per session
  CONSTRAINT unique_student_allocation UNIQUE(student_id, session_id)
);

CREATE INDEX idx_allocations_student ON allocations(student_id);
CREATE INDEX idx_allocations_room ON allocations(room_id);
CREATE INDEX idx_allocations_session ON allocations(session_id);
CREATE INDEX idx_allocations_status ON allocations(status);
```

#### Table: `warden_assignments`
```sql
CREATE TABLE warden_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warden_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES profiles(id), -- Admin who assigned
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT unique_warden_hostel UNIQUE(warden_id, hostel_id)
);

CREATE INDEX idx_warden_assignments_warden ON warden_assignments(warden_id);
CREATE INDEX idx_warden_assignments_hostel ON warden_assignments(hostel_id);
```

#### Table: `ballot_configurations`
```sql
CREATE TABLE ballot_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
  
  -- Weights (must sum to 1.0)
  payment_weight DECIMAL(3,2) DEFAULT 0.50,
  category_weight DECIMAL(3,2) DEFAULT 0.30,
  level_weight DECIMAL(3,2) DEFAULT 0.20,
  
  -- Priority scores for categories
  fresh_student_score INTEGER DEFAULT 100,
  final_year_score INTEGER DEFAULT 90,
  level_300_score INTEGER DEFAULT 70,
  level_200_score INTEGER DEFAULT 60,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  
  CONSTRAINT check_weights_sum CHECK (payment_weight + category_weight + level_weight = 1.0),
  CONSTRAINT unique_config_per_session UNIQUE(session_id)
);
```

#### Table: `ballot_logs`
```sql
CREATE TABLE ballot_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES academic_sessions(id),
  total_applicants INTEGER NOT NULL,
  total_verified_payments INTEGER NOT NULL,
  total_available_spaces INTEGER NOT NULL,
  total_allocated INTEGER NOT NULL,
  
  configuration_used JSONB NOT NULL, -- Store ballot config for audit
  run_at TIMESTAMPTZ DEFAULT NOW(),
  run_by UUID NOT NULL REFERENCES profiles(id),
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_ballot_logs_session ON ballot_logs(session_id);
```

#### Table: `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL, -- e.g., "payment_verified", "allocation_created"
  entity_type VARCHAR(50), -- e.g., "application", "allocation"
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  reason TEXT, -- For manual actions
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

### 6.2 Database Functions (PostgreSQL)

#### Function: Calculate Priority Score
```sql
CREATE OR REPLACE FUNCTION calculate_priority_score(
  p_application_id UUID,
  p_config_id UUID
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_payment_score DECIMAL(5,2);
  v_category_score DECIMAL(5,2);
  v_level_score DECIMAL(5,2);
  v_priority_score DECIMAL(5,2);
  
  v_payment_verified_at TIMESTAMPTZ;
  v_student_level INTEGER;
  v_application_start TIMESTAMPTZ;
  v_application_end TIMESTAMPTZ;
  
  v_config RECORD;
BEGIN
  -- Get ballot configuration
  SELECT * INTO v_config FROM ballot_configurations WHERE id = p_config_id;
  
  -- Get application details
  SELECT 
    ha.payment_verified_at,
    p.level,
    s.application_start_date,
    s.application_end_date
  INTO 
    v_payment_verified_at,
    v_student_level,
    v_application_start,
    v_application_end
  FROM hostel_applications ha
  JOIN profiles p ON ha.student_id = p.id
  JOIN academic_sessions s ON ha.session_id = s.id
  WHERE ha.id = p_application_id;
  
  -- Calculate payment score (earlier payment = higher score)
  v_payment_score := 100 - (
    (EXTRACT(EPOCH FROM (v_payment_verified_at - v_application_start)) /
     EXTRACT(EPOCH FROM (v_application_end - v_application_start))) * 100
  );
  v_payment_score := GREATEST(0, v_payment_score); -- Ensure non-negative
  
  -- Calculate category score
  IF v_student_level = 100 THEN
    v_category_score := v_config.fresh_student_score;
  ELSIF v_student_level >= 400 THEN
    v_category_score := v_config.final_year_score;
  ELSIF v_student_level = 300 THEN
    v_category_score := v_config.level_300_score;
  ELSE
    v_category_score := v_config.level_200_score;
  END IF;
  
  -- Calculate level score (similar to category, can be customized)
  CASE v_student_level
    WHEN 100 THEN v_level_score := 100;
    WHEN 400 THEN v_level_score := 95;
    WHEN 300 THEN v_level_score := 85;
    ELSE v_level_score := 75;
  END CASE;
  
  -- Calculate total priority score
  v_priority_score := 
    (v_payment_score * v_config.payment_weight) +
    (v_category_score * v_config.category_weight) +
    (v_level_score * v_config.level_weight);
  
  RETURN ROUND(v_priority_score, 2);
END;
$$ LANGUAGE plpgsql;
```

#### Function: Run Ballot Allocation
```sql
CREATE OR REPLACE FUNCTION run_ballot_allocation(
  p_session_id UUID,
  p_admin_id UUID
)
RETURNS TABLE(
  application_id UUID,
  student_id UUID,
  allocated_room_id UUID,
  bed_space_number INTEGER,
  priority_score DECIMAL(5,2)
) AS $$
DECLARE
  v_config_id UUID;
  v_application RECORD;
  v_available_room RECORD;
  v_bed_space INTEGER;
BEGIN
  -- Get ballot configuration
  SELECT id INTO v_config_id FROM ballot_configurations WHERE session_id = p_session_id;
  
  -- Calculate priority scores for all verified applications
  UPDATE hostel_applications ha
  SET priority_score = calculate_priority_score(ha.id, v_config_id)
  WHERE ha.session_id = p_session_id
    AND ha.payment_verified = TRUE
    AND ha.status = 'payment_verified';
  
  -- Allocate rooms based on priority score (highest first)
  FOR v_application IN
    SELECT 
      ha.id as application_id,
      ha.student_id,
      ha.first_choice_hostel_id,
      ha.second_choice_hostel_id,
      ha.third_choice_hostel_id,
      ha.priority_score,
      p.gender
    FROM hostel_applications ha
    JOIN profiles p ON ha.student_id = p.id
    WHERE ha.session_id = p_session_id
      AND ha.payment_verified = TRUE
      AND ha.status = 'payment_verified'
    ORDER BY ha.priority_score DESC
  LOOP
    -- Try to allocate to first choice
    v_available_room := NULL;
    
    SELECT r.*, h.gender INTO v_available_room
    FROM rooms r
    JOIN hostels h ON r.hostel_id = h.id
    WHERE h.id = v_application.first_choice_hostel_id
      AND h.gender = v_application.gender
      AND r.is_available = TRUE
      AND r.current_occupancy < r.capacity
    LIMIT 1;
    
    -- If no room in first choice, try second choice
    IF v_available_room IS NULL THEN
      SELECT r.*, h.gender INTO v_available_room
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE h.id = v_application.second_choice_hostel_id
        AND h.gender = v_application.gender
        AND r.is_available = TRUE
        AND r.current_occupancy < r.capacity
      LIMIT 1;
    END IF;
    
    -- If no room in second choice, try third choice
    IF v_available_room IS NULL THEN
      SELECT r.*, h.gender INTO v_available_room
      FROM rooms r
      JOIN hostels h ON r.hostel_id = h.id
      WHERE h.id = v_application.third_choice_hostel_id
        AND h.gender = v_application.gender
        AND r.is_available = TRUE
        AND r.current_occupancy < r.capacity
      LIMIT 1;
    END IF;
    
    -- If room found, allocate
    IF v_available_room IS NOT NULL THEN
      -- Find next available bed space
      v_bed_space := v_available_room.current_occupancy + 1;
      
      -- Create allocation
      INSERT INTO allocations (
        student_id,
        application_id,
        room_id,
        session_id,
        bed_space_number,
        allocation_type,
        allocated_by,
        status
      ) VALUES (
        v_application.student_id,
        v_application.application_id,
        v_available_room.id,
        p_session_id,
        v_bed_space,
        'ballot',
        p_admin_id,
        'active'
      );
      
      -- Update room occupancy
      UPDATE rooms
      SET current_occupancy = current_occupancy + 1
      WHERE id = v_available_room.id;
      
      -- Update application status
      UPDATE hostel_applications
      SET status = 'balloted'
      WHERE id = v_application.application_id;
      
      -- Return allocation result
      RETURN QUERY SELECT 
        v_application.application_id,
        v_application.student_id,
        v_available_room.id,
        v_bed_space,
        v_application.priority_score;
    ELSE
      -- Mark as not allocated (no room available)
      UPDATE hostel_applications
      SET status = 'not_allocated'
      WHERE id = v_application.application_id;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;
```

### 6.3 Row Level Security (RLS) Policies

#### Profiles Table RLS
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Students can only view their own profile
CREATE POLICY "Students can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id OR role = 'admin' OR role = 'warden');

-- Students can update their own profile (limited fields)
CREATE POLICY "Students can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Only admins can insert profiles
CREATE POLICY "Only admins can create profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

#### Allocations Table RLS
```sql
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Students can view their own allocations
CREATE POLICY "Students can view own allocations"
ON allocations FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warden'))
);

-- Only admins can create allocations
CREATE POLICY "Only admins can create allocations"
ON allocations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Wardens can update check-in/out status for their hostels
CREATE POLICY "Wardens can update check-in/out"
ON allocations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM warden_assignments wa
    JOIN rooms r ON wa.hostel_id = r.hostel_id
    WHERE wa.warden_id = auth.uid() AND r.id = allocations.room_id
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

#### Applications Table RLS
```sql
ALTER TABLE hostel_applications ENABLE ROW LEVEL SECURITY;

-- Students can view and create their own applications
CREATE POLICY "Students can view own applications"
ON hostel_applications FOR SELECT
TO authenticated
USING (
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'warden'))
);

CREATE POLICY "Students can create applications"
ON hostel_applications FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

-- Only admins can update payment verification
CREATE POLICY "Admins can update applications"
ON hostel_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

---

## 7. API ENDPOINTS (Supabase + Custom)

### 7.1 Supabase Auto-Generated REST API

Supabase automatically creates REST endpoints for all tables:

```
# Base URL: https://[your-project].supabase.co/rest/v1

# Profiles
GET    /profiles?select=*
GET    /profiles?id=eq.{uuid}
POST   /profiles
PATCH  /profiles?id=eq.{uuid}
DELETE /profiles?id=eq.{uuid}

# Applications
GET    /hostel_applications?select=*,profiles(*),hostels(*)
POST   /hostel_applications
PATCH  /hostel_applications?id=eq.{uuid}

# Allocations
GET    /allocations?select=*,rooms(*,hostels(*))
POST   /allocations

# Hostels
GET    /hostels?select=*
POST   /hostels
PATCH  /hostels?id=eq.{uuid}

# Rooms
GET    /rooms?select=*,hostels(*)
POST   /rooms
PATCH  /rooms?id=eq.{uuid}
```

### 7.2 Custom API Endpoints (Next.js API Routes or PostgreSQL Functions)

For complex business logic, create custom endpoints:

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/reset-password
```

#### Student Endpoints
```
# Profile
GET    /api/student/profile
PUT    /api/student/profile
POST   /api/student/upload-photo

# Applications
GET    /api/student/applications
POST   /api/student/apply
GET    /api/student/application-status

# Allocations
GET    /api/student/allocation
GET    /api/student/allocation/letter (Download PDF)
POST   /api/student/upload-receipt
```

#### Admin Endpoints
```
# Payment Verification
GET    /api/admin/applications/pending
POST   /api/admin/verify-payment
POST   /api/admin/bulk-verify-payments
POST   /api/admin/unverify-payment

# Ballot
POST   /api/admin/ballot/configure
POST   /api/admin/ballot/run (Calls PostgreSQL function)
GET    /api/admin/ballot/results
POST   /api/admin/ballot/approve

# Manual Allocation
POST   /api/admin/allocate-manual
POST   /api/admin/deallocate
POST   /api/admin/swap-rooms

# Hostel Management
POST   /api/admin/hostels
PUT    /api/admin/hostels/:id
DELETE /api/admin/hostels/:id

# Room Management
POST   /api/admin/rooms
POST   /api/admin/rooms/bulk-create
PUT    /api/admin/rooms/:id
DELETE /api/admin/rooms/:id

# Reports
GET    /api/admin/reports/allocations (Export CSV/Excel)
GET    /api/admin/reports/occupancy
GET    /api/admin/reports/payments
GET    /api/admin/analytics/dashboard
```

#### Warden Endpoints
```
# Dashboard
GET    /api/warden/dashboard (Overview stats)
GET    /api/warden/hostels (Assigned hostels)

# Rooms
GET    /api/warden/rooms
GET    /api/warden/rooms/:id
PUT    /api/warden/rooms/:id/notes

# Students
GET    /api/warden/students
POST   /api/warden/check-in
POST   /api/warden/check-out

# Reports
GET    /api/warden/reports/occupancy
GET    /api/warden/reports/students
```

#### Public Endpoints (No Auth Required)
```
# Allocation Lookup (Supervisor's Requirement)
GET    /api/public/allocation/:matric_number
Response:
{
  "matric_number": "YABATECH/2024/ND/CSC/001",
  "student_name": "John Doe",
  "hostel_name": "Bakassi Hostel",
  "room_number": "B204",
  "bed_space_number": 3,
  "current_occupants": 4,
  "roommates": [
    { "name": "Alice Smith", "matric_number": "..." },
    { "name": "Bob Johnson", "matric_number": "..." },
    ...
  ]
}
```

---

## 8. AUTHENTICATION & AUTHORIZATION

### 8.1 Supabase Authentication Flow

#### Student Registration
```typescript
// 1. Student registers via Supabase Auth
const { data, error } = await supabase.auth.signUp({
  email: studentEmail,
  password: password,
  options: {
    data: {
      matric_number: matricNumber,
      role: 'student'
    }
  }
});

// 2. Trigger creates profile entry
// (using Supabase trigger on auth.users insert)

// 3. Email verification sent
// 4. Student verifies email
// 5. Student can now login
```

#### Login Flow
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email, // or matric_number (custom logic)
  password: password
});

// Supabase returns JWT with user info
// Frontend stores token and user role
```

#### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "email": "student@example.com",
  "role": "student",
  "aud": "authenticated",
  "exp": 1234567890,
  "user_metadata": {
    "matric_number": "YABATECH/2024/ND/CSC/001",
    "role": "student"
  }
}
```

### 8.2 Role-Based Access Control (RBAC)

#### Middleware (Next.js)
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect('/login');
  }
  
  const { role } = user.user_metadata;
  const path = request.nextUrl.pathname;
  
  // Role-based routing
  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect('/unauthorized');
  }
  
  if (path.startsWith('/warden') && !['warden', 'admin'].includes(role)) {
    return NextResponse.redirect('/unauthorized');
  }
  
  return NextResponse.next();
}
```

### 8.3 Security Measures

- ✅ JWT tokens with short expiration (15 min)
- ✅ Refresh token rotation
- ✅ Row Level Security on all tables
- ✅ HTTPS only (enforced by Supabase)
- ✅ Password hashing (bcrypt via Supabase)
- ✅ Rate limiting on sensitive endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ CORS configuration
- ✅ Audit logging for critical actions

---

## 9. CORE WORKFLOWS

### 9.1 Student Application Workflow

```
┌──────────────────┐
│  Student Login   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Submit Application│
│  - Select 3 hostel│
│    preferences     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Pay School      │ (Offline - Outside System)
│  Upload Receipt  │ (Optional)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Wait for Admin   │
│ to Verify Payment│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Payment Verified │
│ (Timestamp Recorded)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Wait for Ballot  │
│ Check Priority Score│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Ballot Run      │
│  (Allocation Done)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ View Allocation  │
│ - Hostel Name    │
│ - Room Number    │
│ - Bed Space      │
│ - Roommates      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Download Letter  │
│ Move to Hostel   │
└──────────────────┘
```

### 9.2 Admin Ballot Workflow

```
┌──────────────────┐
│ Configure Ballot │
│ - Set weights    │
│ - Set deadlines  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Verify Payments  │
│ (Mark as Verified)│
│ Timestamp Recorded│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Run Ballot       │
│ (Call PostgreSQL │
│  Function)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ System Calculates│
│ Priority Scores  │
│ Ranks Students   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Allocate Rooms   │
│ Based on:        │
│ - Priority Score │
│ - Preferences    │
│ - Availability   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Review Results   │
│ Check Stats      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Approve          │
│ Allocations      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Students Notified│
│ Can View         │
│ Allocations      │
└──────────────────┘
```

### 9.3 Warden Check-In Workflow

```
┌──────────────────┐
│ Student Arrives  │
│ at Hostel        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Warden Verifies  │
│ Allocation Letter│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Search Student   │
│ in System        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ View Allocation  │
│ Details          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Mark as          │
│ Checked-In       │
│ (Timestamp)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Room Occupancy   │
│ Count Updated    │
└──────────────────┘
```

---

## 10. DATA VALIDATION RULES

### 10.1 Input Validation

#### Matric Number Format
```typescript
// Example: YABATECH/2024/ND/CSC/001
const matricRegex = /^YABATECH\/\d{4}\/(ND|HND)\/[A-Z]{2,5}\/\d{3,4}$/;

// Validation:
if (!matricRegex.test(matricNumber)) {
  throw new Error("Invalid matric number format");
}
```

#### Email
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Must be valid email format
// Preferably @yabatech.edu.ng or @student.yabatech.edu.ng
```

#### Phone Number
```typescript
// Nigerian phone format: 0801234567 or +2348012345678
const phoneRegex = /^(\+234|0)[789]\d{9}$/;
```

#### Password
```
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)
```

#### Photo Upload
```
- Max file size: 2MB
- Allowed formats: JPEG, PNG
- Dimensions: Max 1000x1000px (auto-resize)
```

### 10.2 Business Logic Validation

#### Application Period
```typescript
// Can only apply during active session's application period
const session = await getActiveSession();
const now = new Date();

if (now < session.application_start_date || now > session.application_end_date) {
  throw new Error("Application period has closed");
}
```

#### Payment Verification
```typescript
// Only admins can verify payments
// Cannot verify same payment twice (unless unverified first)
// Timestamp must be recorded
```

#### Ballot Eligibility
```typescript
// Student must:
// - Have submitted application
// - Have verified payment
// - Be marked as eligible (by admin)
// - Not already allocated for current session
```

#### Room Allocation
```typescript
// Room must:
// - Be available (is_available = true)
// - Match student gender (male → male hostel)
// - Have available bed spaces (current_occupancy < capacity)
// - Be in student's preferred hostels (1st, 2nd, or 3rd choice)
```

---

## 11. ERROR HANDLING

### 11.1 Error Codes & Messages

```typescript
enum ErrorCode {
  // Authentication
  AUTH_INVALID_CREDENTIALS = "AUTH001",
  AUTH_EMAIL_NOT_VERIFIED = "AUTH002",
  AUTH_SESSION_EXPIRED = "AUTH003",
  AUTH_UNAUTHORIZED = "AUTH004",
  
  // Application
  APP_ALREADY_APPLIED = "APP001",
  APP_PERIOD_CLOSED = "APP002",
  APP_INVALID_PREFERENCE = "APP003",
  
  // Payment
  PAY_NOT_VERIFIED = "PAY001",
  PAY_ALREADY_VERIFIED = "PAY002",
  
  // Allocation
  ALLOC_NO_ROOMS_AVAILABLE = "ALLOC001",
  ALLOC_ALREADY_ALLOCATED = "ALLOC002",
  ALLOC_GENDER_MISMATCH = "ALLOC003",
  ALLOC_ROOM_FULL = "ALLOC004",
  
  // General
  VALIDATION_ERROR = "VAL001",
  NOT_FOUND = "NOT001",
  SERVER_ERROR = "SRV001"
}
```

### 11.2 Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

// Example:
{
  "success": false,
  "error": {
    "code": "APP001",
    "message": "You have already applied for this session",
    "details": {
      "session": "2024/2025",
      "application_date": "2024-08-15T10:30:00Z"
    },
    "timestamp": "2024-08-20T14:22:15Z"
  }
}
```

---

## 12. PERFORMANCE REQUIREMENTS

### 12.1 Response Time

- **API Endpoints:** < 500ms (95th percentile)
- **Database Queries:** < 200ms (95th percentile)
- **Ballot Calculation:** < 30 seconds for 5,000 students
- **Page Load:** < 2 seconds (first contentful paint)
- **PDF Generation:** < 5 seconds

### 12.2 Scalability

- **Concurrent Users:** Support 500+ concurrent users
- **Database:** Handle 10,000+ student records
- **File Storage:** Support 20,000+ images (profile photos, receipts)
- **Annual Growth:** 20% increase in students per year

### 12.3 Availability

- **Uptime:** 99.5% (target)
- **Maintenance Window:** Sunday 2-4 AM WAT
- **Backup Frequency:** Daily automated backups (Supabase)
- **Recovery Time Objective (RTO):** < 4 hours
- **Recovery Point Objective (RPO):** < 24 hours

---

## 13. TESTING STRATEGY

### 13.1 Unit Tests

**Focus Areas:**
- Priority score calculation function
- Payment verification logic
- Room allocation algorithm
- Input validation functions
- Data transformation utilities

**Tools:** Jest, Vitest

### 13.2 Integration Tests

**Focus Areas:**
- API endpoints (POST /api/admin/verify-payment)
- Database operations (CRUD)
- Supabase RLS policies
- Authentication flows
- Ballot process (end-to-end)

**Tools:** Jest + Supertest, Playwright

### 13.3 E2E Tests

**Critical User Flows:**
1. Student registration → Application → View allocation
2. Admin payment verification → Ballot run → Approve
3. Warden check-in process

**Tools:** Playwright, Cypress

### 13.4 Load Testing

**Scenarios:**
- 500 concurrent students applying simultaneously
- 100 admins verifying payments at once
- Ballot run with 5,000 students

**Tools:** k6, Artillery

### 13.5 Security Testing

- **Penetration Testing:** Hire security firm (optional)
- **Vulnerability Scanning:** OWASP ZAP, Snyk
- **SQL Injection Tests:** Manual + automated
- **RLS Policy Verification:** Attempt unauthorized access

---

## 14. DEPLOYMENT STRATEGY

### 14.1 Environments

#### Development
- **Frontend:** localhost:3000
- **Backend:** Supabase dev project
- **Database:** Supabase dev instance
- **Purpose:** Local development and testing

#### Staging
- **Frontend:** Vercel staging deployment
- **Backend:** Supabase staging project
- **Database:** Supabase staging instance
- **Purpose:** Pre-production testing, UAT

#### Production
- **Frontend:** Vercel production (hostel.yabatech.edu.ng)
- **Backend:** Supabase production project
- **Database:** Supabase production instance
- **Purpose:** Live system for students, wardens, admins

### 14.2 Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] Backup created
- [ ] Rollback plan documented

**Deployment Steps:**
1. Run database migrations (Supabase CLI)
2. Deploy backend API (if custom layer)
3. Deploy frontend (Vercel auto-deploy on merge)
4. Verify critical endpoints
5. Smoke tests
6. Monitor logs for errors

**Post-Deployment:**
- [ ] Verify all core features working
- [ ] Check database connections
- [ ] Monitor error rates
- [ ] Notify stakeholders
- [ ] Update documentation

### 14.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm test
      - run: npm run lint
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 15. MONITORING & ANALYTICS

### 15.1 System Monitoring

**Metrics to Track:**
- API response times
- Database query performance
- Error rates by endpoint
- Active user sessions
- Server uptime
- Storage usage

**Tools:** 
- Supabase Dashboard (built-in metrics)
- Vercel Analytics
- Sentry (error tracking)
- LogRocket (session replay)

### 15.2 Business Metrics

**Key Performance Indicators (KPIs):**
- Total applications submitted
- Payment verification rate
- Average time to verify payment
- Allocation success rate (allocated / total applicants)
- Average priority score
- Occupancy rate by hostel
- Student satisfaction score (post-allocation survey)

### 15.3 Audit & Compliance

- All critical actions logged in `audit_logs` table
- Admin actions tracked (who did what, when)
- Ballot process fully auditable
- Payment verification audit trail
- Manual allocation reasons recorded

---

## 16. DOCUMENTATION REQUIREMENTS

### 16.1 Technical Documentation

- ✅ API documentation (Swagger/OpenAPI)
- ✅ Database schema diagram (ERD)
- ✅ Architecture overview
- ✅ Deployment guide
- ✅ Environment setup guide
- ✅ Code comments (inline)

### 16.2 User Documentation

- ✅ Student guide (How to apply, check allocation)
- ✅ Warden guide (How to check-in students, view reports)
- ✅ Admin guide (How to run ballot, verify payments)
- ✅ FAQ section
- ✅ Video tutorials (optional but recommended)

### 16.3 Training Materials

- ✅ Admin training session (2 hours)
- ✅ Warden training session (1 hour)
- ✅ Student orientation guide (written + video)

---

## 17. SUCCESS CRITERIA

### 17.1 Launch Criteria

The system is ready to launch when:
- [ ] All core features implemented and tested
- [ ] All three roles can perform their tasks successfully
- [ ] Ballot algorithm tested with sample data (100+ students)
- [ ] Security audit completed
- [ ] Admin and warden training completed
- [ ] Student guide published
- [ ] 99.9% test coverage for critical paths
- [ ] Load testing passed (500 concurrent users)
- [ ] Stakeholder sign-off obtained

### 17.2 Post-Launch Success Metrics (3 Months)

- **Adoption:** 80%+ of eligible students use the system
- **Accuracy:** 99%+ allocation accuracy (no double allocations)
- **Efficiency:** 50% reduction in allocation time vs manual process
- **User Satisfaction:** 4.0+ average rating (out of 5)
- **System Uptime:** 99.5%+
- **Error Rate:** < 0.5% of transactions
- **Payment Verification:** Average time < 24 hours

---

## 18. RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Supabase service downtime | High | Low | Implement retry logic, use Supabase status page for monitoring |
| Ballot algorithm bias/unfairness | High | Medium | Extensive testing, transparent parameters, allow admin configuration |
| Manual payment verification delays | Medium | High | Set SLA for admins (24hr), batch verification tool, send reminders |
| Database performance degradation | Medium | Medium | Proper indexing, query optimization, caching, monitor slow queries |
| Security breach (unauthorized access) | High | Low | RLS policies, regular security audits, penetration testing |
| User resistance (low adoption) | Medium | Medium | Training sessions, clear user guides, support helpdesk |
| Data loss | High | Very Low | Daily backups, point-in-time recovery (Supabase), audit logs |
| Scalability issues during peak | Medium | Medium | Load testing, auto-scaling (Supabase handles this), rate limiting |

---

## 19. FUTURE ENHANCEMENTS (Phase 2+)

### 19.1 Short-term (6-12 months)
- Mobile app (React Native / Flutter)
- SMS notifications (payment verified, allocation results)
- Advanced analytics dashboard for admin
- Roommate matching algorithm (personality-based)
- Online payment integration (Paystack/Flutterwave)
- Maintenance request system

### 19.2 Long-term (12+ months)
- Multi-campus support
- Integration with academic management system (student records)
- Biometric check-in/out (fingerprint/face recognition)
- IoT integration (room sensors, occupancy detection)
- Parent/guardian portal
- Alumni room booking (for events)
- Marketplace (students selling/renting items)

---

## 20. CONCLUSION

This PRD outlines a comprehensive, modern hostel management system tailored to YABATECH's needs. The system prioritizes:

1. **Simplicity:** Core features focused on supervisor's requirements
2. **Fairness:** Payment-priority ballot system with transparency
3. **Efficiency:** Automated processes reducing manual work
4. **Scalability:** Built on Supabase for easy growth
5. **Security:** RLS policies and proper authentication

**Key Differentiators:**
- Payment-timestamp-based priority ranking
- Three-tier RBAC with granular permissions
- Full audit trail for accountability
- Modern tech stack (Supabase + Next.js)
- Public allocation lookup (enter matric → see allocation)

**Next Steps:**
1. Get stakeholder approval on scope
2. Set up Supabase project
3. Create database schema
4. Implement authentication
5. Build student application flow
6. Build admin ballot system
7. Build warden dashboard
8. Test thoroughly
9. Train users
10. Launch! 🚀

---

## APPENDIX A: Sample API Requests

### Student: View Own Allocation
```typescript
// GET /api/student/allocation
// Headers: Authorization: Bearer {jwt_token}

// Response:
{
  "success": true,
  "data": {
    "matric_number": "YABATECH/2024/ND/CSC/001",
    "student_name": "John Doe",
    "session": "2024/2025",
    "allocation": {
      "hostel_name": "Bakassi Hostel",
      "room_number": "B204",
      "bed_space_number": 3,
      "floor_number": 2,
      "room_capacity": 4,
      "current_occupants": 4,
      "roommates": [
        {
          "name": "Alice Smith",
          "matric_number": "YABATECH/2024/ND/CSC/002",
          "department": "Computer Science",
          "level": 100
        },
        {
          "name": "Bob Johnson",
          "matric_number": "YABATECH/2024/ND/EEE/010",
          "department": "Electrical Engineering",
          "level": 100
        },
        {
          "name": "Carol White",
          "matric_number": "YABATECH/2024/ND/CSC/005",
          "department": "Computer Science",
          "level": 100
        }
      ]
    },
    "allocation_date": "2024-09-01T10:00:00Z",
    "check_in_status": "checked_in",
    "check_in_date": "2024-09-05T14:30:00Z"
  }
}
```

### Admin: Verify Payment
```typescript
// POST /api/admin/verify-payment
// Headers: Authorization: Bearer {jwt_token}

// Request Body:
{
  "application_id": "uuid-here",
  "verified": true,
  "notes": "Payment slip verified - Ref: PAY/2024/001234"
}

// Response:
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "application_id": "uuid-here",
    "student_matric": "YABATECH/2024/ND/CSC/001",
    "payment_verified_at": "2024-08-20T15:45:00Z",
    "verified_by": "Admin Name",
    "priority_score": null // Will be calculated during ballot
  }
}
```

### Admin: Run Ballot
```typescript
// POST /api/admin/ballot/run
// Headers: Authorization: Bearer {jwt_token}

// Request Body:
{
  "session_id": "uuid-here",
  "confirm": true
}

// Response:
{
  "success": true,
  "message": "Ballot completed successfully",
  "data": {
    "ballot_log_id": "uuid-here",
    "total_applicants": 2500,
    "verified_payments": 2300,
    "available_spaces": 1800,
    "allocated": 1800,
    "not_allocated": 500,
    "allocation_rate": "78.26%",
    "run_at": "2024-09-01T10:00:00Z",
    "status": "pending_approval"
  }
}
```

---

## APPENDIX B: Database Diagram (Text Format)

```
profiles (users)
├── id (PK)
├── matric_number (UNIQUE)
├── email (UNIQUE)
├── role (student/warden/admin)
└── ... (personal info)

academic_sessions
├── id (PK)
├── name (2024/2025)
├── application_start_date
└── is_active (UNIQUE WHERE TRUE)

hostels
├── id (PK)
├── name
├── gender
└── total_capacity

rooms
├── id (PK)
├── hostel_id (FK → hostels)
├── room_number
├── capacity
└── current_occupancy

hostel_applications
├── id (PK)
├── student_id (FK → profiles)
├── session_id (FK → academic_sessions)
├── payment_verified
├── payment_verified_at (CRITICAL FOR PRIORITY)
├── priority_score
└── status

allocations
├── id (PK)
├── student_id (FK → profiles)
├── room_id (FK → rooms)
├── session_id (FK → academic_sessions)
├── bed_space_number
├── check_in_date
└── status

warden_assignments
├── id (PK)
├── warden_id (FK → profiles)
└── hostel_id (FK → hostels)

ballot_configurations
├── id (PK)
├── session_id (FK → academic_sessions)
├── payment_weight
├── category_weight
└── level_weight

audit_logs
├── id (PK)
├── user_id (FK → profiles)
├── action
├── entity_type
└── created_at
```

---

**END OF PRD**

*This document is a living document and will be updated as requirements evolve.*

---

**Version:** 1.0  
**Last Updated:** February 11, 2026  
**Author:** Backend Development Team  
**Stakeholders:** YABATECH Management, IT Department, Student Affairs