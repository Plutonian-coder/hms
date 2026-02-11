-- ============================================================
-- Setup Ballot Test Data
-- This script creates test data to verify the ballot system works
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Ensure active session exists
DO $$
DECLARE
  v_session_id UUID;
BEGIN
  SELECT id INTO v_session_id FROM academic_sessions WHERE is_active = TRUE LIMIT 1;

  IF v_session_id IS NULL THEN
    INSERT INTO academic_sessions (name, start_date, end_date, is_active)
    VALUES ('2026/2027', '2026-09-01', '2027-06-30', TRUE)
    RETURNING id INTO v_session_id;

    RAISE NOTICE 'Created active session: %', v_session_id;
  ELSE
    RAISE NOTICE 'Using existing active session: %', v_session_id;
  END IF;
END $$;

-- Step 2: Ensure YabaTech hostels exist (from your seed file)
INSERT INTO public.hostels (name, gender, total_capacity, current_occupancy, description, is_active)
VALUES
  ('Akata Hostel', 'male', 200, 0, 'Male hostel located within YabaTech campus.', TRUE),
  ('PGD Hall', 'male', 200, 0, 'Post Graduate Diploma hall.', TRUE),
  ('New Female Hostel', 'female', 200, 0, 'Modern female hostel within YabaTech campus.', TRUE),
  ('Hollywood Hostel', 'male', 200, 0, 'Male hostel facility at YabaTech.', TRUE),
  ('Bakassi Hostel', 'male', 200, 0, 'Male hostel at YabaTech campus.', TRUE),
  ('Complex Hostel', 'female', 200, 0, 'Female hostel complex within YabaTech campus.', TRUE)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Step 3: Create test rooms for each hostel (10 rooms per hostel, 4 beds each)
DO $$
DECLARE
  v_hostel RECORD;
  v_room_count INTEGER;
BEGIN
  FOR v_hostel IN
    SELECT id, name FROM hostels WHERE deleted_at IS NULL AND is_active = TRUE
  LOOP
    -- Check if rooms already exist
    SELECT COUNT(*) INTO v_room_count
    FROM rooms
    WHERE hostel_id = v_hostel.id AND deleted_at IS NULL;

    IF v_room_count = 0 THEN
      -- Create 10 rooms with 4 beds each
      INSERT INTO rooms (hostel_id, room_number, floor_number, capacity, room_type, is_available, current_occupancy)
      SELECT
        v_hostel.id,
        'R' || LPAD(s::text, 3, '0'),  -- R001, R002, ..., R010
        (s - 1) / 5 + 1,  -- 5 rooms per floor
        4,  -- 4 beds per room
        'standard',
        TRUE,
        0
      FROM generate_series(1, 10) s;

      RAISE NOTICE 'Created 10 rooms for hostel: %', v_hostel.name;
    ELSE
      RAISE NOTICE 'Rooms already exist for hostel: % (% rooms)', v_hostel.name, v_room_count;
    END IF;
  END LOOP;
END $$;

-- Step 4: Create test students if they don't exist
DO $$
DECLARE
  v_student_id UUID;
  v_session_id UUID;
  v_akata_id UUID;
  v_hollywood_id UUID;
  v_pgd_id UUID;
  v_female_id UUID;
  v_complex_id UUID;
  v_bakassi_id UUID;
BEGIN
  -- Get session ID
  SELECT id INTO v_session_id FROM academic_sessions WHERE is_active = TRUE LIMIT 1;

  -- Get hostel IDs
  SELECT id INTO v_akata_id FROM hostels WHERE name = 'Akata Hostel' LIMIT 1;
  SELECT id INTO v_hollywood_id FROM hostels WHERE name = 'Hollywood Hostel' LIMIT 1;
  SELECT id INTO v_pgd_id FROM hostels WHERE name = 'PGD Hall' LIMIT 1;
  SELECT id INTO v_female_id FROM hostels WHERE name = 'New Female Hostel' LIMIT 1;
  SELECT id INTO v_complex_id FROM hostels WHERE name = 'Complex Hostel' LIMIT 1;
  SELECT id INTO v_bakassi_id FROM hostels WHERE name = 'Bakassi Hostel' LIMIT 1;

  -- Create test male students
  FOR i IN 1..5 LOOP
    -- Check if student exists
    SELECT id INTO v_student_id
    FROM profiles
    WHERE matric_number = 'TEST/2024/00' || i::text
    LIMIT 1;

    IF v_student_id IS NULL THEN
      -- Create student
      INSERT INTO profiles (
        email, role, matric_number, first_name, last_name,
        gender, level, department, phone_number
      )
      VALUES (
        'teststudent' || i::text || '@yabatech.edu.ng',
        'student',
        'TEST/2024/00' || i::text,
        'TestMale' || i::text,
        'Student',
        'male',
        100 + (i - 1) * 100,  -- 100, 200, 300, 400, 400
        'Computer Science',
        '080' || LPAD(i::text, 8, '0')
      )
      RETURNING id INTO v_student_id;

      -- Create application with hostel preferences
      INSERT INTO hostel_applications (
        student_id,
        session_id,
        first_choice_hostel_id,
        second_choice_hostel_id,
        third_choice_hostel_id,
        payment_reference,
        payment_verified,
        payment_verified_at,
        status
      )
      VALUES (
        v_student_id,
        v_session_id,
        v_akata_id,      -- 1st choice: Akata
        v_hollywood_id,  -- 2nd choice: Hollywood
        v_pgd_id,        -- 3rd choice: PGD
        'TEST-REF-M' || i::text,
        TRUE,
        NOW() - (i || ' hours')::INTERVAL,  -- Stagger payment times
        'payment_verified'
      );

      RAISE NOTICE 'Created male test student: TEST/2024/00%', i;
    END IF;
  END LOOP;

  -- Create test female students
  FOR i IN 1..3 LOOP
    -- Check if student exists
    SELECT id INTO v_student_id
    FROM profiles
    WHERE matric_number = 'TEST/2024/F0' || i::text
    LIMIT 1;

    IF v_student_id IS NULL THEN
      -- Create student
      INSERT INTO profiles (
        email, role, matric_number, first_name, last_name,
        gender, level, department, phone_number
      )
      VALUES (
        'testfemale' || i::text || '@yabatech.edu.ng',
        'student',
        'TEST/2024/F0' || i::text,
        'TestFemale' || i::text,
        'Student',
        'female',
        100 + (i - 1) * 100,
        'Computer Science',
        '081' || LPAD(i::text, 8, '0')
      )
      RETURNING id INTO v_student_id;

      -- Create application with hostel preferences
      INSERT INTO hostel_applications (
        student_id,
        session_id,
        first_choice_hostel_id,
        second_choice_hostel_id,
        third_choice_hostel_id,
        payment_reference,
        payment_verified,
        payment_verified_at,
        status
      )
      VALUES (
        v_student_id,
        v_session_id,
        v_female_id,   -- 1st choice: New Female Hostel
        v_complex_id,  -- 2nd choice: Complex
        NULL,
        'TEST-REF-F' || i::text,
        TRUE,
        NOW() - (i || ' hours')::INTERVAL,
        'payment_verified'
      );

      RAISE NOTICE 'Created female test student: TEST/2024/F0%', i;
    END IF;
  END LOOP;
END $$;

-- Step 5: Verify setup
SELECT '=== SETUP COMPLETE ===' as status;

SELECT
  'Hostels' as entity,
  COUNT(*) as count
FROM hostels
WHERE is_active = TRUE AND deleted_at IS NULL
UNION ALL
SELECT
  'Rooms' as entity,
  COUNT(*) as count
FROM rooms r
JOIN hostels h ON h.id = r.hostel_id
WHERE r.is_available = TRUE AND r.deleted_at IS NULL AND h.deleted_at IS NULL
UNION ALL
SELECT
  'Total Bed Capacity' as entity,
  SUM(r.capacity)::INTEGER as count
FROM rooms r
JOIN hostels h ON h.id = r.hostel_id
WHERE r.is_available = TRUE AND r.deleted_at IS NULL AND h.deleted_at IS NULL
UNION ALL
SELECT
  'Students Ready for Ballot' as entity,
  COUNT(*)::INTEGER as count
FROM hostel_applications
WHERE session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
  AND payment_verified = TRUE
  AND status = 'payment_verified';

-- Show students ready for ballot
SELECT
  p.matric_number,
  p.first_name || ' ' || p.last_name as student_name,
  p.gender,
  p.level,
  h1.name as first_choice,
  h2.name as second_choice,
  h3.name as third_choice,
  ha.payment_verified,
  ha.status
FROM hostel_applications ha
JOIN profiles p ON p.id = ha.student_id
LEFT JOIN hostels h1 ON h1.id = ha.first_choice_hostel_id
LEFT JOIN hostels h2 ON h2.id = ha.second_choice_hostel_id
LEFT JOIN hostels h3 ON h3.id = ha.third_choice_hostel_id
WHERE ha.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
  AND ha.payment_verified = TRUE
  AND ha.status = 'payment_verified'
ORDER BY p.matric_number;

SELECT '✅ Test data ready! Go to Admin → Ballot System and click "RUN BALLOT NOW"' as next_step;
