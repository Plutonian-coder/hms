-- ============================================================
-- YABATECH Hostel Management System — Database Migration
-- 001_init.sql
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 0. CLEANUP (Run this if you want to reset the schema)
-- ============================================================
DROP TABLE IF EXISTS public.check_in_out CASCADE;
DROP TABLE IF EXISTS public.allocations CASCADE;
DROP TABLE IF EXISTS public.hostel_applications CASCADE;
DROP TABLE IF EXISTS public.warden_assignments CASCADE;
DROP TABLE IF EXISTS public.bed_spaces CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.hostels CASCADE;
DROP TABLE IF EXISTS public.ballot_runs CASCADE;
DROP TABLE IF EXISTS public.ballot_configs CASCADE;
DROP TABLE IF EXISTS public.academic_sessions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  matric_number VARCHAR(50) UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  level INTEGER CHECK (level IN (100, 200, 300, 400)),
  department VARCHAR(100),
  phone VARCHAR(20),
  photo_url TEXT,
  next_of_kin_name VARCHAR(200),
  next_of_kin_phone VARCHAR(20),
  next_of_kin_relationship VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'warden', 'admin')),
  is_eligible BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_matric ON public.profiles(matric_number);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_level ON public.profiles(level);
CREATE INDEX idx_profiles_gender ON public.profiles(gender);
CREATE INDEX idx_profiles_active ON public.profiles(is_active) WHERE deleted_at IS NULL;

-- ============================================================
-- 2. ACADEMIC SESSIONS
-- ============================================================
CREATE TABLE public.academic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(20) NOT NULL UNIQUE,                  -- e.g. "2024/2025"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  application_start_date TIMESTAMPTZ NOT NULL,
  application_end_date TIMESTAMPTZ NOT NULL,
  ballot_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_session_dates CHECK (start_date < end_date),
  CONSTRAINT chk_app_dates CHECK (application_start_date < application_end_date)
);

-- Only one active session at a time
CREATE UNIQUE INDEX idx_one_active_session ON public.academic_sessions(is_active)
  WHERE is_active = TRUE;

-- ============================================================
-- 3. HOSTELS
-- ============================================================
CREATE TABLE public.hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  total_capacity INTEGER NOT NULL DEFAULT 0,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_hostel_occupancy CHECK (current_occupancy >= 0 AND current_occupancy <= total_capacity)
);

CREATE INDEX idx_hostels_gender ON public.hostels(gender);
CREATE INDEX idx_hostels_active ON public.hostels(is_active) WHERE deleted_at IS NULL;

-- ============================================================
-- 4. ROOMS
-- ============================================================
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  floor_number INTEGER DEFAULT 1,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  room_type VARCHAR(50) DEFAULT 'standard' CHECK (room_type IN ('standard', 'executive')),
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_room_occupancy CHECK (current_occupancy >= 0 AND current_occupancy <= capacity),
  CONSTRAINT uq_room_per_hostel UNIQUE(hostel_id, room_number)
);

CREATE INDEX idx_rooms_hostel ON public.rooms(hostel_id);
CREATE INDEX idx_rooms_available ON public.rooms(is_available) WHERE deleted_at IS NULL;
CREATE INDEX idx_rooms_occupancy ON public.rooms(hostel_id, current_occupancy);

-- ============================================================
-- 5. BED SPACES
-- ============================================================
CREATE TABLE public.bed_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  bed_number INTEGER NOT NULL CHECK (bed_number > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_bed_per_room UNIQUE(room_id, bed_number)
);

CREATE INDEX idx_bed_spaces_room ON public.bed_spaces(room_id);
CREATE INDEX idx_bed_spaces_status ON public.bed_spaces(status);

-- ============================================================
-- 6. WARDEN ASSIGNMENTS
-- ============================================================
CREATE TABLE public.warden_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warden_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT uq_warden_hostel UNIQUE(warden_id, hostel_id)
);

CREATE INDEX idx_warden_assignments_warden ON public.warden_assignments(warden_id);
CREATE INDEX idx_warden_assignments_hostel ON public.warden_assignments(hostel_id);

-- ============================================================
-- 7. HOSTEL APPLICATIONS
-- ============================================================
CREATE TABLE public.hostel_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  application_date TIMESTAMPTZ DEFAULT NOW(),

  -- Hostel preferences
  first_choice_hostel_id UUID REFERENCES public.hostels(id),
  second_choice_hostel_id UUID REFERENCES public.hostels(id),
  third_choice_hostel_id UUID REFERENCES public.hostels(id),

  -- Payment
  payment_receipt_url TEXT,
  payment_verified BOOLEAN DEFAULT FALSE,
  payment_verified_by UUID REFERENCES public.profiles(id),
  payment_verified_at TIMESTAMPTZ,       -- CRITICAL for priority

  -- Ballot
  priority_score DECIMAL(10,4),
  ballot_run_id UUID,                     -- FK added after ballot_runs table

  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'payment_verified', 'balloted', 'allocated', 'not_allocated', 'rejected')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_student_session UNIQUE(student_id, session_id)
);

CREATE INDEX idx_applications_student ON public.hostel_applications(student_id);
CREATE INDEX idx_applications_session ON public.hostel_applications(session_id);
CREATE INDEX idx_applications_status ON public.hostel_applications(status);
CREATE INDEX idx_applications_payment_time ON public.hostel_applications(payment_verified_at);
CREATE INDEX idx_applications_priority ON public.hostel_applications(priority_score DESC NULLS LAST);

-- ============================================================
-- 8. BALLOT CONFIGURATIONS
-- ============================================================
CREATE TABLE public.ballot_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,

  payment_weight DECIMAL(3,2) NOT NULL DEFAULT 0.50,
  category_weight DECIMAL(3,2) NOT NULL DEFAULT 0.30,
  level_weight DECIMAL(3,2) NOT NULL DEFAULT 0.20,

  fresh_student_score INTEGER NOT NULL DEFAULT 100,
  final_year_score INTEGER NOT NULL DEFAULT 90,
  level_300_score INTEGER NOT NULL DEFAULT 70,
  level_200_score INTEGER NOT NULL DEFAULT 60,

  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_weights_sum CHECK (payment_weight + category_weight + level_weight = 1.00),
  CONSTRAINT uq_config_per_session UNIQUE(session_id)
);

-- ============================================================
-- 9. BALLOT RUNS
-- ============================================================
CREATE TABLE public.ballot_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id),
  config_id UUID NOT NULL REFERENCES public.ballot_configs(id),

  total_applicants INTEGER NOT NULL DEFAULT 0,
  total_verified INTEGER NOT NULL DEFAULT 0,
  total_spaces INTEGER NOT NULL DEFAULT 0,
  total_allocated INTEGER NOT NULL DEFAULT 0,
  total_unallocated INTEGER NOT NULL DEFAULT 0,

  config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,

  status VARCHAR(20) NOT NULL DEFAULT 'completed'
    CHECK (status IN ('running', 'completed', 'approved', 'rejected')),

  run_at TIMESTAMPTZ DEFAULT NOW(),
  run_by UUID NOT NULL REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ballot_runs_session ON public.ballot_runs(session_id);

-- Add FK from hostel_applications to ballot_runs
ALTER TABLE public.hostel_applications
  ADD CONSTRAINT fk_applications_ballot_run
  FOREIGN KEY (ballot_run_id) REFERENCES public.ballot_runs(id);

-- ============================================================
-- 10. ALLOCATIONS
-- ============================================================
CREATE TABLE public.allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.hostel_applications(id) ON DELETE CASCADE,
  hostel_id UUID NOT NULL REFERENCES public.hostels(id),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  bed_space_id UUID REFERENCES public.bed_spaces(id),
  session_id UUID NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,

  bed_space_number INTEGER NOT NULL,
  allocation_date TIMESTAMPTZ DEFAULT NOW(),
  allocation_type VARCHAR(20) NOT NULL DEFAULT 'ballot'
    CHECK (allocation_type IN ('ballot', 'manual')),
  allocated_by UUID REFERENCES public.profiles(id),
  reason TEXT,                               -- required for manual overrides

  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'checked_in', 'checked_out', 'revoked')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_bed_per_session UNIQUE(room_id, bed_space_number, session_id),
  CONSTRAINT uq_student_alloc_session UNIQUE(student_id, session_id)
);

CREATE INDEX idx_allocations_student ON public.allocations(student_id);
CREATE INDEX idx_allocations_room ON public.allocations(room_id);
CREATE INDEX idx_allocations_hostel ON public.allocations(hostel_id);
CREATE INDEX idx_allocations_session ON public.allocations(session_id);
CREATE INDEX idx_allocations_status ON public.allocations(status);

-- ============================================================
-- 11. CHECK-IN / CHECK-OUT LOG
-- ============================================================
CREATE TABLE public.check_in_out (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allocation_id UUID NOT NULL REFERENCES public.allocations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  action VARCHAR(10) NOT NULL CHECK (action IN ('check_in', 'check_out')),
  performed_by UUID NOT NULL REFERENCES public.profiles(id),   -- warden
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_checkinout_allocation ON public.check_in_out(allocation_id);
CREATE INDEX idx_checkinout_student ON public.check_in_out(student_id);

-- ============================================================
-- 12. AUDIT LOGS (immutable)
-- ============================================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON public.audit_logs(action);

-- ============================================================
-- 13. STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- 13a. Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    gender,
    role,
    matric_number,
    level,
    department
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'male'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'matric_number',
    (NEW.raw_user_meta_data->>'level')::INTEGER,
    NEW.raw_user_meta_data->>'department'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 13b. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_hostels_updated_at
  BEFORE UPDATE ON public.hostels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.hostel_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_allocations_updated_at
  BEFORE UPDATE ON public.allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON public.academic_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_ballot_configs_updated_at
  BEFORE UPDATE ON public.ballot_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_bed_spaces_updated_at
  BEFORE UPDATE ON public.bed_spaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 13c. Generic audit log trigger
CREATE OR REPLACE FUNCTION public.log_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, new_values)
    VALUES (TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, old_values, new_values)
    VALUES (TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, old_values)
    VALUES (TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach audit triggers to critical tables
CREATE TRIGGER audit_allocations
  AFTER INSERT OR UPDATE OR DELETE ON public.allocations
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER audit_hostel_applications
  AFTER INSERT OR UPDATE OR DELETE ON public.hostel_applications
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER audit_hostels
  AFTER INSERT OR UPDATE OR DELETE ON public.hostels
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER audit_rooms
  AFTER INSERT OR UPDATE OR DELETE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER audit_profiles
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();

CREATE TRIGGER audit_ballot_runs
  AFTER INSERT OR UPDATE ON public.ballot_runs
  FOR EACH ROW EXECUTE FUNCTION public.log_audit();

-- ============================================================
-- POSTGRESQL FUNCTIONS — BALLOT LOGIC
-- ============================================================

-- 14a. Calculate Priority Score
CREATE OR REPLACE FUNCTION public.calculate_priority_score(
  p_application_id UUID,
  p_config_id UUID
)
RETURNS DECIMAL(10,4)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_score DECIMAL(10,4);
  v_category_score DECIMAL(10,4);
  v_level_score DECIMAL(10,4);
  v_total DECIMAL(10,4);
  v_payment_verified_at TIMESTAMPTZ;
  v_student_level INTEGER;
  v_app_start TIMESTAMPTZ;
  v_app_end TIMESTAMPTZ;
  v_total_period DOUBLE PRECISION;
  v_elapsed DOUBLE PRECISION;
  v_cfg RECORD;
BEGIN
  -- Load ballot configuration
  SELECT * INTO v_cfg FROM public.ballot_configs WHERE id = p_config_id;
  IF v_cfg IS NULL THEN
    RAISE EXCEPTION 'Ballot configuration % not found', p_config_id;
  END IF;

  -- Load application + profile + session data
  SELECT
    ha.payment_verified_at,
    p.level,
    s.application_start_date,
    s.application_end_date
  INTO
    v_payment_verified_at,
    v_student_level,
    v_app_start,
    v_app_end
  FROM public.hostel_applications ha
  JOIN public.profiles p ON p.id = ha.student_id
  JOIN public.academic_sessions s ON s.id = ha.session_id
  WHERE ha.id = p_application_id;

  -- ---- Payment Time Score ----
  -- Earlier verification => higher score (100 = instant, 0 = last moment)
  v_total_period := EXTRACT(EPOCH FROM (v_app_end - v_app_start));
  IF v_total_period <= 0 THEN
    v_payment_score := 50; -- fallback
  ELSE
    v_elapsed := EXTRACT(EPOCH FROM (v_payment_verified_at - v_app_start));
    v_payment_score := GREATEST(0, 100.0 - ((v_elapsed / v_total_period) * 100.0));
  END IF;

  -- ---- Category Score ----
  IF v_student_level = 100 THEN
    v_category_score := v_cfg.fresh_student_score;
  ELSIF v_student_level >= 400 THEN
    v_category_score := v_cfg.final_year_score;
  ELSIF v_student_level = 300 THEN
    v_category_score := v_cfg.level_300_score;
  ELSE
    v_category_score := v_cfg.level_200_score;
  END IF;

  -- ---- Level Score ----
  CASE v_student_level
    WHEN 100 THEN v_level_score := 100;
    WHEN 400 THEN v_level_score := 95;
    WHEN 300 THEN v_level_score := 85;
    ELSE v_level_score := 75;
  END CASE;

  -- ---- Weighted Total ----
  v_total := ROUND(
    (v_payment_score * v_cfg.payment_weight) +
    (v_category_score * v_cfg.category_weight) +
    (v_level_score * v_cfg.level_weight),
    4
  );

  RETURN v_total;
END;
$$;


-- 14b. Run Ballot Allocation (atomic)
CREATE OR REPLACE FUNCTION public.run_ballot_allocation(
  p_session_id UUID,
  p_admin_id UUID
)
RETURNS UUID   -- returns ballot_run_id
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_run_id UUID;
  v_app RECORD;
  v_room RECORD;
  v_bed INTEGER;
  v_total_applicants INTEGER := 0;
  v_total_verified INTEGER := 0;
  v_total_spaces INTEGER := 0;
  v_total_allocated INTEGER := 0;
  v_hostel_choices UUID[];
  v_choice UUID;
  v_allocated BOOLEAN;
BEGIN
  -- 1. Load ballot config
  SELECT * INTO v_config FROM public.ballot_configs WHERE session_id = p_session_id;
  IF v_config IS NULL THEN
    RAISE EXCEPTION 'No ballot configuration found for session %', p_session_id;
  END IF;

  -- 2. Count stats
  SELECT COUNT(*) INTO v_total_applicants
    FROM public.hostel_applications WHERE session_id = p_session_id;

  SELECT COUNT(*) INTO v_total_verified
    FROM public.hostel_applications
    WHERE session_id = p_session_id AND payment_verified = TRUE;

  SELECT COALESCE(SUM(r.capacity - r.current_occupancy), 0) INTO v_total_spaces
    FROM public.rooms r
    JOIN public.hostels h ON h.id = r.hostel_id
    WHERE h.is_active = TRUE AND r.is_available = TRUE AND r.deleted_at IS NULL AND h.deleted_at IS NULL;

  -- 3. Create ballot run record
  INSERT INTO public.ballot_runs (
    session_id, config_id,
    total_applicants, total_verified, total_spaces,
    total_allocated, total_unallocated,
    config_snapshot, status, run_by
  ) VALUES (
    p_session_id, v_config.id,
    v_total_applicants, v_total_verified, v_total_spaces,
    0, 0,
    to_jsonb(v_config), 'running', p_admin_id
  ) RETURNING id INTO v_run_id;

  -- 4. Calculate priority scores for all verified, pending applications
  UPDATE public.hostel_applications ha
  SET priority_score = public.calculate_priority_score(ha.id, v_config.id),
      ballot_run_id = v_run_id
  WHERE ha.session_id = p_session_id
    AND ha.payment_verified = TRUE
    AND ha.status = 'payment_verified';

  -- 5. Iterate in priority order and allocate
  FOR v_app IN
    SELECT
      ha.id AS application_id,
      ha.student_id,
      ha.first_choice_hostel_id,
      ha.second_choice_hostel_id,
      ha.third_choice_hostel_id,
      ha.priority_score,
      p.gender AS student_gender
    FROM public.hostel_applications ha
    JOIN public.profiles p ON p.id = ha.student_id
    WHERE ha.session_id = p_session_id
      AND ha.payment_verified = TRUE
      AND ha.status = 'payment_verified'
    ORDER BY ha.priority_score DESC NULLS LAST
  LOOP
    v_allocated := FALSE;
    v_hostel_choices := ARRAY[
      v_app.first_choice_hostel_id,
      v_app.second_choice_hostel_id,
      v_app.third_choice_hostel_id
    ];

    -- Try each preference in order
    FOREACH v_choice IN ARRAY v_hostel_choices
    LOOP
      CONTINUE WHEN v_choice IS NULL;

      -- Find a room with capacity in matching-gender hostel
      SELECT r.* INTO v_room
      FROM public.rooms r
      JOIN public.hostels h ON h.id = r.hostel_id
      WHERE h.id = v_choice
        AND h.gender = v_app.student_gender
        AND h.is_active = TRUE
        AND h.deleted_at IS NULL
        AND r.is_available = TRUE
        AND r.deleted_at IS NULL
        AND r.current_occupancy < r.capacity
      ORDER BY r.current_occupancy ASC, r.room_number ASC  -- fill evenly
      LIMIT 1
      FOR UPDATE OF r;   -- lock the row

      IF v_room IS NOT NULL THEN
        v_bed := v_room.current_occupancy + 1;

        -- Create allocation
        INSERT INTO public.allocations (
          student_id, application_id, hostel_id, room_id,
          session_id, bed_space_number,
          allocation_type, allocated_by, status
        ) VALUES (
          v_app.student_id, v_app.application_id, v_choice, v_room.id,
          p_session_id, v_bed,
          'ballot', p_admin_id, 'active'
        );

        -- Update room occupancy
        UPDATE public.rooms SET current_occupancy = current_occupancy + 1
        WHERE id = v_room.id;

        -- Update hostel occupancy
        UPDATE public.hostels SET current_occupancy = current_occupancy + 1
        WHERE id = v_choice;

        -- Mark bed space as occupied (if bed_spaces rows exist)
        UPDATE public.bed_spaces
        SET status = 'occupied'
        WHERE room_id = v_room.id AND bed_number = v_bed;

        -- Update application status
        UPDATE public.hostel_applications
        SET status = 'balloted'
        WHERE id = v_app.application_id;

        v_total_allocated := v_total_allocated + 1;
        v_allocated := TRUE;
        EXIT; -- break out of preference loop
      END IF;
    END LOOP;

    -- If none of the preferences had space
    IF NOT v_allocated THEN
      UPDATE public.hostel_applications
      SET status = 'not_allocated'
      WHERE id = v_app.application_id;
    END IF;
  END LOOP;

  -- 6. Finalize ballot run
  UPDATE public.ballot_runs
  SET status = 'completed',
      total_allocated = v_total_allocated,
      total_unallocated = v_total_verified - v_total_allocated
  WHERE id = v_run_id;

  RETURN v_run_id;
END;
$$;

-- ============================================================
-- HELPER: Auto-generate bed_spaces when a room is created
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_bed_spaces()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..NEW.capacity LOOP
    INSERT INTO public.bed_spaces (room_id, bed_number, status)
    VALUES (NEW.id, i, 'available');
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_bed_spaces
  AFTER INSERT ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.generate_bed_spaces();

-- ============================================================
-- HELPER: Update hostel total_capacity when rooms change
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_hostel_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_hostel_id UUID;
BEGIN
  v_hostel_id := COALESCE(NEW.hostel_id, OLD.hostel_id);
  UPDATE public.hostels
  SET total_capacity = (
    SELECT COALESCE(SUM(capacity), 0)
    FROM public.rooms
    WHERE hostel_id = v_hostel_id AND deleted_at IS NULL AND is_available = TRUE
  )
  WHERE id = v_hostel_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_hostel_capacity
  AFTER INSERT OR UPDATE OR DELETE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.sync_hostel_capacity();
