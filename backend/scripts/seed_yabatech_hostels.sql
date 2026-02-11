-- ============================================================
-- Seed YabaTech Hostels — Real Hostel Names
-- Run this in Supabase SQL Editor
-- ============================================================
-- These are actual hostels at Yaba College of Technology.
-- Adjust total_capacity as needed.

-- 1. Akata Hostel (Male)
INSERT INTO public.hostels (name, gender, total_capacity, current_occupancy, description, is_active)
VALUES (
  'Akata Hostel',
  'male',
  200, 0,
  'Male hostel located within YabaTech campus. One of the primary accommodation facilities for male students.',
  TRUE
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. PGD Hall (Male)
INSERT INTO public.hostels (name, gender, total_capacity, current_occupancy, description, is_active)
VALUES (
  'PGD Hall',
  'male',
  200, 0,
  'Post Graduate Diploma hall. Designated accommodation for higher-level male students.',
  TRUE
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 3. New Female Hostel (Female)
INSERT INTO public.hostels (name, gender, total_capacity, current_occupancy, description, is_active)
VALUES (
  'New Female Hostel',
  'female',
  200, 0,
  'Modern female hostel within YabaTech campus. Primary accommodation facility for female students.',
  TRUE
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 4. Hollywood Hostel (Male)
INSERT INTO public.hostels (name, gender, total_capacity, current_occupancy, description, is_active)
VALUES (
  'Hollywood Hostel',
  'male',
  200, 0,
  'Male hostel facility at YabaTech. Popular accommodation block for male students.',
  TRUE
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 5. Bakassi Hostel (Male)
INSERT INTO public.hostels (name, gender, total_capacity, current_occupancy, description, is_active)
VALUES (
  'Bakassi Hostel',
  'male',
  200, 0,
  'Male hostel at YabaTech campus. Named after the Bakassi region.',
  TRUE
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 6. Complex Hostel (Female)
INSERT INTO public.hostels (name, gender, total_capacity, current_occupancy, description, is_active)
VALUES (
  'Complex Hostel',
  'female',
  200, 0,
  'Female hostel complex within YabaTech campus. Provides shared accommodation for female students.',
  TRUE
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- ============================================================
-- Verify seeded hostels
-- ============================================================
SELECT id, name, gender, total_capacity, current_occupancy, is_active
FROM public.hostels
WHERE deleted_at IS NULL
ORDER BY name;
