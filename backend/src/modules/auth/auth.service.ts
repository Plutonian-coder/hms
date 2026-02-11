// ============================================================
// Auth Service
// ============================================================
import { supabaseAdmin } from '../../config/supabase';
import { AppError, ErrorCode } from '../../utils/errors';
import { Profile } from '../../types';

export class AuthService {
    /**
     * Register a new student user
     */
    async register(data: {
        email?: string;
        password?: string;
        first_name: string;
        last_name: string;
        matric_number: string;
        gender: string;
        level: number;
        department: string;
        phone?: string;
    }): Promise<{ user_id: string; profile: Profile }> {
        // Sanitize matric number for email generation
        const sanitizedMatric = data.matric_number.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const generatedEmail = data.email || `${sanitizedMatric}@student.hms`;
        const generatedPassword = data.password || data.last_name.toUpperCase();

        // Check if matric number already exists
        const { data: existing } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('matric_number', data.matric_number)
            .maybeSingle();

        if (existing) {
            throw AppError.conflict(ErrorCode.CONFLICT, 'Matric number already registered');
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: generatedEmail,
            password: generatedPassword,
            email_confirm: true, // auto-confirm
            user_metadata: {
                first_name: data.first_name,
                last_name: data.last_name,
                matric_number: data.matric_number,
                gender: data.gender,
                level: data.level,
                department: data.department,
                role: 'student',
            },
        });

        if (authError || !authData.user) {
            console.error('[AUTH ERROR]', authError);
            throw new AppError(400, ErrorCode.AUTH_REGISTRATION_FAILED, authError?.message || 'Registration failed');
        }

        // The trigger handle_new_user() will auto-create the profile.
        // Fetch the created profile.
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError || !profile) {
            // If trigger didn't fire, create manually
            const { data: manualProfile, error: manualError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: generatedEmail,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    matric_number: data.matric_number,
                    gender: data.gender,
                    level: data.level,
                    department: data.department,
                    phone: data.phone || null,
                    role: 'student',
                })
                .select()
                .single();

            if (manualError) {
                console.error('[PROFILE ERROR]', manualError);
                throw new AppError(500, ErrorCode.DB_ERROR, 'Failed to create user profile');
            }

            return { user_id: authData.user.id, profile: manualProfile as Profile };
        }

        // Update phone if provided
        if (data.phone) {
            await supabaseAdmin
                .from('profiles')
                .update({ phone: data.phone })
                .eq('id', authData.user.id);
        }

        return { user_id: authData.user.id, profile: profile as Profile };
    }

    /**
     * Login with email + password (Admin/Staff)
     */
    async login(email: string, password: string): Promise<{
        access_token: string;
        refresh_token: string;
        profile: Profile;
    }> {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.session) {
            throw new AppError(401, ErrorCode.AUTH_INVALID_CREDENTIALS, 'Invalid email or password');
        }

        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .is('deleted_at', null)
            .single();

        if (profileError || !profile) {
            throw new AppError(401, ErrorCode.AUTH_UNAUTHORIZED, 'User profile not found');
        }

        if (!(profile as Profile).is_active) {
            throw new AppError(403, ErrorCode.AUTH_FORBIDDEN, 'Account is deactivated');
        }

        return {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            profile: profile as Profile,
        };
    }

    /**
     * Student Login (Matric + Surname)
     */
    async studentLogin(matricNumber: string, surname: string): Promise<{
        access_token: string;
        refresh_token: string;
        profile: Profile;
    }> {
        // 1. Check if profile exists
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('matric_number', matricNumber)
            .is('deleted_at', null)
            .maybeSingle();

        if (!profile) {
            // Return 404 to signal frontend to show registration form
            throw AppError.notFound(ErrorCode.NOT_FOUND, 'Student not found');
        }

        // 2. Verify surname
        if (profile.last_name.toLowerCase() !== surname.toLowerCase()) {
            throw new AppError(401, ErrorCode.AUTH_INVALID_CREDENTIALS, 'Surname does not match matric number');
        }

        // 3. Login using constructed credentials
        // Use the email stored in profile, or reconstruct it
        const email = profile.email;
        const password = surname.toUpperCase(); // Assumed convention

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.session) {
            // Fallback: If password doesn't match default, it might have been changed.
            // But for this flow, we assume simple password.
            console.error('[STUDENT LOGIN FAIL]', error);
            throw new AppError(401, ErrorCode.AUTH_INVALID_CREDENTIALS, 'Authentication failed. Please contact admin.');
        }

        return {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            profile: profile as Profile,
        };
    }

    /**
     * Get profile by user ID
     */
    async getProfile(userId: string): Promise<Profile> {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .is('deleted_at', null)
            .single();

        if (error || !data) {
            throw AppError.notFound(ErrorCode.NOT_FOUND, 'Profile not found');
        }

        return data as Profile;
    }
}

export const authService = new AuthService();
