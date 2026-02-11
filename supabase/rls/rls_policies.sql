-- ============================================================
-- YABATECH Hostel Management System — Row Level Security
-- rls_policies.sql
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Students see own profile; wardens see students in assigned hostels; admins see all
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.warden_assignments wa
      WHERE wa.warden_id = auth.uid() AND wa.is_active = TRUE
    )
  );

-- Users update own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insert is handled by trigger (SECURITY DEFINER), but allow service role
CREATE POLICY "profiles_insert_service" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins can soft-delete
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 2. HOSTELS
-- ============================================================
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read hostels
CREATE POLICY "hostels_select" ON public.hostels
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- Only admins can insert/update/delete
CREATE POLICY "hostels_insert_admin" ON public.hostels
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "hostels_update_admin" ON public.hostels
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "hostels_delete_admin" ON public.hostels
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 3. ROOMS
-- ============================================================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read rooms (students need to see available rooms)
CREATE POLICY "rooms_select" ON public.rooms
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- Only admins can CUD
CREATE POLICY "rooms_insert_admin" ON public.rooms
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "rooms_update_admin" ON public.rooms
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Wardens can update notes on rooms in their assigned hostels
CREATE POLICY "rooms_update_warden" ON public.rooms
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.warden_assignments wa
      WHERE wa.warden_id = auth.uid()
        AND wa.hostel_id = rooms.hostel_id
        AND wa.is_active = TRUE
    )
  );

CREATE POLICY "rooms_delete_admin" ON public.rooms
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 4. BED SPACES
-- ============================================================
ALTER TABLE public.bed_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bed_spaces_select" ON public.bed_spaces
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "bed_spaces_modify_admin" ON public.bed_spaces
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 5. HOSTEL APPLICATIONS
-- ============================================================
ALTER TABLE public.hostel_applications ENABLE ROW LEVEL SECURITY;

-- Students see own; wardens see assigned hostels; admins see all
CREATE POLICY "applications_select_student" ON public.hostel_applications
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.warden_assignments wa
      WHERE wa.warden_id = auth.uid() AND wa.is_active = TRUE
        AND (
          wa.hostel_id = hostel_applications.first_choice_hostel_id
          OR wa.hostel_id = hostel_applications.second_choice_hostel_id
          OR wa.hostel_id = hostel_applications.third_choice_hostel_id
        )
    )
  );

-- Students create own applications
CREATE POLICY "applications_insert_student" ON public.hostel_applications
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Only admins update applications (payment verification, ballot status)
CREATE POLICY "applications_update_admin" ON public.hostel_applications
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 6. ALLOCATIONS
-- ============================================================
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;

-- Students see own; wardens see assigned hostel; admins see all
CREATE POLICY "allocations_select" ON public.allocations
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.warden_assignments wa
      WHERE wa.warden_id = auth.uid()
        AND wa.hostel_id = allocations.hostel_id
        AND wa.is_active = TRUE
    )
  );

-- Only admins/system can insert (ballot or manual)
CREATE POLICY "allocations_insert_admin" ON public.allocations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admins and wardens can update (check-in/check-out)
CREATE POLICY "allocations_update" ON public.allocations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
      SELECT 1 FROM public.warden_assignments wa
      WHERE wa.warden_id = auth.uid()
        AND wa.hostel_id = allocations.hostel_id
        AND wa.is_active = TRUE
    )
  );

-- ============================================================
-- 7. CHECK-IN/OUT
-- ============================================================
ALTER TABLE public.check_in_out ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkinout_select" ON public.check_in_out
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warden'))
  );

CREATE POLICY "checkinout_insert" ON public.check_in_out
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'warden'))
  );

-- ============================================================
-- 8. ACADEMIC SESSIONS
-- ============================================================
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "sessions_select" ON public.academic_sessions
  FOR SELECT TO authenticated
  USING (TRUE);

-- Only admins CUD
CREATE POLICY "sessions_insert_admin" ON public.academic_sessions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "sessions_update_admin" ON public.academic_sessions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "sessions_delete_admin" ON public.academic_sessions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 9. BALLOT CONFIGS
-- ============================================================
ALTER TABLE public.ballot_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ballot_configs_select" ON public.ballot_configs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ballot_configs_insert_admin" ON public.ballot_configs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ballot_configs_update_admin" ON public.ballot_configs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 10. BALLOT RUNS
-- ============================================================
ALTER TABLE public.ballot_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ballot_runs_select" ON public.ballot_runs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ballot_runs_insert_admin" ON public.ballot_runs
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "ballot_runs_update_admin" ON public.ballot_runs
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 11. WARDEN ASSIGNMENTS
-- ============================================================
ALTER TABLE public.warden_assignments ENABLE ROW LEVEL SECURITY;

-- Wardens see own; admins see all
CREATE POLICY "warden_assignments_select" ON public.warden_assignments
  FOR SELECT TO authenticated
  USING (
    warden_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "warden_assignments_insert_admin" ON public.warden_assignments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "warden_assignments_update_admin" ON public.warden_assignments
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "warden_assignments_delete_admin" ON public.warden_assignments
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 12. AUDIT LOGS
-- ============================================================
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insert is done by triggers using SECURITY DEFINER; allow all authenticated for direct inserts
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

-- ============================================================
-- 13. STORAGE POLICIES
-- ============================================================

-- Receipts: students upload own; admins read all
CREATE POLICY "receipts_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "receipts_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Photos: users upload own; everyone reads
CREATE POLICY "photos_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "photos_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'photos');

-- Allow public read on photos bucket (it's marked public)
CREATE POLICY "photos_public_select" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'photos');
