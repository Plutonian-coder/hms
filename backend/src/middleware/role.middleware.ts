// ============================================================
// Role Middleware — RBAC enforcement
// ============================================================
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { AppError, ErrorCode } from '../utils/errors';

/**
 * Factory middleware: checks that the authenticated user has one of the allowed roles.
 * Must be used AFTER authMiddleware.
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new AppError(401, ErrorCode.AUTH_UNAUTHORIZED, 'Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError(
                    403,
                    ErrorCode.AUTH_FORBIDDEN,
                    `Access denied. Required role(s): ${allowedRoles.join(', ')}`
                )
            );
        }

        next();
    };
}
