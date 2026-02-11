// ============================================================
// Auth Middleware — JWT verification via Supabase
// ============================================================
import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest, Profile } from '../types';
import { AppError, ErrorCode } from '../utils/errors';

export async function authMiddleware(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, ErrorCode.AUTH_TOKEN_MISSING, 'Missing or invalid Authorization header');
        }

        const token = authHeader.split(' ')[1];

        // Verify the JWT with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            throw new AppError(401, ErrorCode.AUTH_TOKEN_INVALID, 'Invalid or expired token');
        }

        // Fetch the profile from the database
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .is('deleted_at', null)
            .single();

        if (profileError || !profile) {
            throw new AppError(401, ErrorCode.AUTH_UNAUTHORIZED, 'User profile not found');
        }

        if (!profile.is_active) {
            throw new AppError(403, ErrorCode.AUTH_FORBIDDEN, 'Account is deactivated');
        }

        // Attach user info to the request object
        req.user = {
            id: user.id,
            email: user.email || '',
            role: (profile as Profile).role,
            profile: profile as Profile,
            accessToken: token,
        };

        next();
    } catch (err) {
        next(err);
    }
}
