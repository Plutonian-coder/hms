import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTestUser() {
    const email = 'student@yabatech.edu.ng';
    const password = 'password123';
    const matricNumber = 'F/ND/23/3210137';

    console.log(`Creating test user: ${email} ...`);

    // 1. Check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users.users.find(u => u.email === email);

    if (existingUser) {
        console.log('User already exists. Updating metadata...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
                user_metadata: {
                    first_name: 'Test',
                    last_name: 'Student',
                    matric_number: matricNumber,
                    role: 'student',
                    level: 100,
                    department: 'Computer Science',
                    gender: 'male'
                }
                // password: password // Don't reset password to avoid locking out if they changed it
            }
        );

        if (updateError) {
            console.error('Error updating user:', updateError);
        } else {
            console.log('User updated successfully.');
            console.log('credentials:', { email, password, matricNumber });
        }
    } else {
        // 2. Create new user
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name: 'Test',
                last_name: 'Student',
                matric_number: matricNumber,
                role: 'student',
                level: 100,
                department: 'Computer Science',
                gender: 'male'
            }
        });

        if (error) {
            console.error('Error creating user:', error);
        } else {
            console.log('User created successfully:', data.user.id);
            console.log('credentials:', { email, password, matricNumber });
        }
    }
}

createTestUser();
