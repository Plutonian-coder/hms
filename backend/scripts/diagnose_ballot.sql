-- ============================================================
-- Ballot System Diagnostic Script
-- Run this in Supabase SQL Editor to diagnose ballot issues
-- ============================================================

-- 1. CHECK ACTIVE SESSION
SELECT '=== ACTIVE SESSION ===' as check_section;
SELECT id, name, is_active, start_date, end_date
FROM academic_sessions
WHERE is_active = TRUE;

-- 2. CHECK HOSTELS
SELECT '=== HOSTELS (Active) ===' as check_section;
SELECT
  id,
  name,
  gender,
  total_capacity,
  current_occupancy,
  (total_capacity - current_occupancy) as available,
  is_active
FROM hostels
WHERE is_active = TRUE AND deleted_at IS NULL
ORDER BY name;

-- 3. CHECK ROOMS
SELECT '=== ROOMS (Available) ===' as check_section;
SELECT
  h.name as hostel_name,
  h.gender,
  COUNT(r.id) as total_rooms,
  SUM(r.capacity) as total_beds,
  SUM(r.current_occupancy) as occupied_beds,
  SUM(r.capacity - r.current_occupancy) as available_beds
FROM rooms r
JOIN hostels h ON h.id = r.hostel_id
WHERE r.is_available = TRUE
  AND r.deleted_at IS NULL
  AND h.deleted_at IS NULL
GROUP BY h.id, h.name, h.gender
ORDER BY h.name;

-- 4. CHECK STUDENT APPLICATIONS BY STATUS
SELECT '=== APPLICATIONS SUMMARY ===' as check_section;
SELECT
  status,
  payment_verified,
  COUNT(*) as count
FROM hostel_applications
WHERE session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
GROUP BY status, payment_verified
ORDER BY status;

-- 5. CHECK STUDENTS READY FOR BALLOT
SELECT '=== STUDENTS READY FOR BALLOT ===' as check_section;
SELECT
  p.matric_number,
  p.first_name,
  p.last_name,
  p.gender,
  h1.name as first_choice,
  h1.gender as hostel_gender,
  CASE WHEN p.gender = h1.gender THEN '✓ Match' ELSE '✗ MISMATCH!' END as gender_match,
  ha.payment_verified,
  ha.status
FROM hostel_applications ha
JOIN profiles p ON p.id = ha.student_id
LEFT JOIN hostels h1 ON h1.id = ha.first_choice_hostel_id
WHERE ha.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
  AND ha.payment_verified = TRUE
  AND ha.status = 'payment_verified'
ORDER BY p.matric_number;

-- 6. CHECK EXISTING ALLOCATIONS
SELECT '=== EXISTING ALLOCATIONS ===' as check_section;
SELECT
  h.name as hostel,
  COUNT(a.id) as allocated_students
FROM allocations a
JOIN hostels h ON h.id = a.hostel_id
WHERE a.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
  AND a.status IN ('active', 'checked_in')
GROUP BY h.id, h.name
ORDER BY h.name;

-- ============================================================
-- QUICK FIX: If you need to create test rooms
-- ============================================================
-- Uncomment and run this section if you have hostels but no rooms

-- SELECT '=== CREATING TEST ROOMS ===' as action;
--
-- INSERT INTO rooms (hostel_id, room_number, floor_number, capacity, room_type, is_available, current_occupancy)
-- SELECT
--   h.id,
--   'R' || LPAD(s::text, 3, '0'),  -- R001, R002, etc.
--   (s - 1) / 10 + 1,
--   4,
--   'standard',
--   TRUE,
--   0
-- FROM hostels h
-- CROSS JOIN generate_series(1, 10) s
-- WHERE h.deleted_at IS NULL
--   AND h.is_active = TRUE
--   AND NOT EXISTS (
--     SELECT 1 FROM rooms r WHERE r.hostel_id = h.id LIMIT 1
--   );
--
-- SELECT 'Rooms created! Run diagnostic again to verify.' as result;

-- ============================================================
-- SUMMARY
-- ============================================================
SELECT '=== BALLOT READINESS SUMMARY ===' as check_section;

WITH stats AS (
  SELECT
    (SELECT COUNT(*) FROM academic_sessions WHERE is_active = TRUE) as active_sessions,
    (SELECT COUNT(*) FROM hostels WHERE is_active = TRUE AND deleted_at IS NULL) as active_hostels,
    (SELECT COALESCE(SUM(r.capacity - r.current_occupancy), 0)
     FROM rooms r
     JOIN hostels h ON h.id = r.hostel_id
     WHERE r.is_available = TRUE AND r.deleted_at IS NULL AND h.deleted_at IS NULL) as available_beds,
    (SELECT COUNT(*)
     FROM hostel_applications
     WHERE session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
       AND payment_verified = TRUE
       AND status = 'payment_verified') as ready_students
)
SELECT
  active_sessions,
  active_hostels,
  available_beds,
  ready_students,
  CASE
    WHEN active_sessions = 0 THEN '❌ NO ACTIVE SESSION - Create one first!'
    WHEN active_hostels = 0 THEN '❌ NO HOSTELS - Run seed_yabatech_hostels.sql'
    WHEN available_beds = 0 THEN '❌ NO ROOMS - Create rooms for your hostels'
    WHEN ready_students = 0 THEN '❌ NO VERIFIED STUDENTS - Verify payment for applications'
    ELSE '✅ READY TO RUN BALLOT'
  END as ballot_status
FROM stats;
