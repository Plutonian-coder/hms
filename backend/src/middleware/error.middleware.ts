// ============================================================
// Global Error Handler
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof AppError) {
        console.error('[APP ERROR]', err.message, err.details); // Debug log
        sendError(res, err.statusCode, err.code, err.message, err.details);
        return;
    }

    // Supabase errors often have a `code` and `message` property
    const supaErr = err as { code?: string; message?: string; status?: number };
    if (supaErr.code && supaErr.status) {
        sendError(res, supaErr.status, supaErr.code, supaErr.message || 'Database error');
        return;
    }

    // Unknown errors
    console.error('[UNHANDLED ERROR]', err);
    sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
