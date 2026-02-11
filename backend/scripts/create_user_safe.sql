-- Create user if not exists using a PL/PGSQL block
DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  v_user_email TEXT := 'student@yabatech.edu.ng';
  v_user_password TEXT := 'password123';
BEGIN
  -- 1. Check if user already exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_user_email) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
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
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      v_user_email,
      crypt(v_user_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name":"Test","last_name":"Student","matric_number":"F/ND/23/3210137","role":"student","level":100,"department":"Computer Science","gender":"male"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  ELSE
    -- User exists, get their ID
    SELECT id INTO new_user_id FROM auth.users WHERE email = v_user_email;
  END IF;

  -- 2. Upsert into public.profiles
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
    new_user_id,
    v_user_email,
    'Test',
    'Student',
    'F/ND/23/3210137',
    'student',
    100,
    'Computer Science',
    'male'
  )
  ON CONFLICT (id) DO UPDATE SET
    matric_number = EXCLUDED.matric_number,
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name;

END $$;
