// ============================================================
// Validation Middleware — Zod integration
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError, ErrorCode } from '../utils/errors';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validates the specified part of the request using a Zod schema.
 * Parsed data replaces the original on success.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const parsed = schema.parse(req[target]);
            // Replace with parsed (coerced/defaulted) data
            (req as unknown as Record<string, unknown>)[target] = parsed;
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const details = err.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                console.error('[VALIDATION ERROR]', details); // Debug log
                return next(
                    new AppError(400, ErrorCode.VALIDATION_ERROR, 'Validation failed', details)
                );
            }
            next(err);
        }
    };
}
