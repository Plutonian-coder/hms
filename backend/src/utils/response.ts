import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '../types';

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode = 200): void {
    const body: ApiSuccessResponse<T> = { success: true, data };
    if (message) body.message = message;
    res.status(statusCode).json(body);
}

export function sendError(res: Response, statusCode: number, code: string, message: string, details?: unknown): void {
    const body: ApiErrorResponse = {
        success: false,
        error: {
            code,
            message,
            timestamp: new Date().toISOString(),
            ...(details !== undefined && { details }),
        },
    };
    res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
    sendSuccess(res, data, message, 201);
}
