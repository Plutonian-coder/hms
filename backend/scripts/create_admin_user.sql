-- ============================================================
-- Create Admin User — YABATECH HMS
-- Run this in Supabase SQL Editor
-- ============================================================
DO $$
DECLARE
  v_user_email TEXT := 'admin@yabatech.edu.ng';
  v_new_user_id UUID;
  v_existing_profile_id UUID;
BEGIN
  -- 1. Check if a profile with this email already exists
  SELECT id INTO v_existing_profile_id FROM public.profiles WHERE email = v_user_email;

  -- If profile exists but user doesn't match, remove the profile first
  IF v_existing_profile_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_existing_profile_id AND email = v_user_email) THEN
        DELETE FROM public.profiles WHERE id = v_existing_profile_id;
    END IF;
  END IF;

  -- 2. Check if user currently exists in auth.users
  SELECT id INTO v_new_user_id FROM auth.users WHERE email = v_user_email;
  
  IF v_new_user_id IS NULL THEN
    v_new_user_id := gen_random_uuid();
    
    -- Insert into auth.users (Trigger will fire and create profile)
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      v_new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_user_email,
      crypt('Admin@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'first_name', 'System',
        'last_name', 'Administrator',
        'role', 'admin',
        'gender', 'male'
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  ELSE
    -- User exists, update metadata and password
    UPDATE auth.users
    SET encrypted_password = crypt('Admin@123', gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object(
          'first_name', 'System',
          'last_name', 'Administrator',
          'role', 'admin',
          'gender', 'male'
        ),
        updated_at = now()
    WHERE id = v_new_user_id;

    -- Manually update profile since trigger only runs on INSERT
    INSERT INTO public.profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      gender,
      is_active,
      is_eligible
    ) VALUES (
      v_new_user_id,
      v_user_email,
      'System',
      'Administrator',
      'admin',
      'male',
      TRUE,
      TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
      role = EXCLUDED.role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      is_active = EXCLUDED.is_active;
  END IF;

END $$;

-- ============================================================
-- Verify the admin was created correctly
-- ============================================================
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  p.is_active,
  p.created_at
FROM public.profiles p
WHERE p.email = 'admin@yabatech.edu.ng';
