-- ============================================================
-- Fix Active Session Dates
-- Run this in Supabase SQL Editor to open the application window
-- ============================================================

-- 1. Extend application period for the active session
UPDATE public.academic_sessions
SET 
  application_start_date = NOW() - INTERVAL '2 days',
  application_end_date = NOW() + INTERVAL '30 days',
  start_date = CURRENT_DATE - INTERVAL '1 month',
  end_date = CURRENT_DATE + INTERVAL '6 months'
WHERE is_active = TRUE;

-- 2. Verify the update
SELECT name, is_active, application_start_date, application_end_date 
FROM public.academic_sessions 
WHERE is_active = TRUE;
