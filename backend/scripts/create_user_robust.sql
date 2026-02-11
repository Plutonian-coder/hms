DO $$
DECLARE
  v_user_email TEXT := 'student@yabatech.edu.ng';
  v_matric_number TEXT := 'F/ND/23/3210137';
  v_new_user_id UUID;
  v_existing_profile_id UUID;
BEGIN
  -- 1. Check if a profile with this matric number already exists
  SELECT id INTO v_existing_profile_id FROM public.profiles WHERE matric_number = v_matric_number;
  
  -- If profile exists but user doesn't match (or we want to reset), remove the profile first
  -- This avoids the unique constraint violation when the trigger tries to create a new profile
  IF v_existing_profile_id IS NOT NULL THEN
    -- Check if this profile is linked to our target email user
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_existing_profile_id AND email = v_user_email) THEN
        -- It's a stale profile or belongs to another user, delete it to free up the matric number
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
      crypt('password123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'first_name', 'Test',
        'last_name', 'Student',
        'matric_number', v_matric_number,
        'role', 'student',
        'level', 100,
        'department', 'Computer Science',
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
    SET encrypted_password = crypt('password123', gen_salt('bf')),
        raw_user_meta_data = jsonb_build_object(
          'first_name', 'Test',
          'last_name', 'Student',
          'matric_number', v_matric_number,
          'role', 'student',
          'level', 100,
          'department', 'Computer Science',
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
      matric_number,
      role,
      level,
      department,
      gender
    ) VALUES (
      v_new_user_id,
      v_user_email,
      'Test',
      'Student',
      v_matric_number,
      'student',
      100,
      'Computer Science',
      'male'
    )
    ON CONFLICT (id) DO UPDATE SET
      matric_number = EXCLUDED.matric_number,
      role = EXCLUDED.role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      level = EXCLUDED.level,
      department = EXCLUDED.department,
      gender = EXCLUDED.gender;
  END IF;

END $$;
