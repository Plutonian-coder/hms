// ============================================================
// AppError class and error codes
// ============================================================

export enum ErrorCode {
    // Auth
    AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
    AUTH_EMAIL_NOT_VERIFIED = 'AUTH_EMAIL_NOT_VERIFIED',
    AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
    AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
    AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
    AUTH_TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
    AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
    AUTH_REGISTRATION_FAILED = 'AUTH_REGISTRATION_FAILED',

    // Application
    APP_ALREADY_APPLIED = 'APP_ALREADY_APPLIED',
    APP_PERIOD_CLOSED = 'APP_PERIOD_CLOSED',
    APP_INVALID_PREFERENCE = 'APP_INVALID_PREFERENCE',
    APP_NOT_FOUND = 'APP_NOT_FOUND',
    APP_NOT_ELIGIBLE = 'APP_NOT_ELIGIBLE',

    // Payment
    PAY_NOT_VERIFIED = 'PAY_NOT_VERIFIED',
    PAY_ALREADY_VERIFIED = 'PAY_ALREADY_VERIFIED',

    // Allocation
    ALLOC_NO_ROOMS = 'ALLOC_NO_ROOMS',
    ALLOC_ALREADY_ALLOCATED = 'ALLOC_ALREADY_ALLOCATED',
    ALLOC_GENDER_MISMATCH = 'ALLOC_GENDER_MISMATCH',
    ALLOC_ROOM_FULL = 'ALLOC_ROOM_FULL',
    ALLOC_NOT_FOUND = 'ALLOC_NOT_FOUND',

    // Ballot
    BALLOT_NO_CONFIG = 'BALLOT_NO_CONFIG',
    BALLOT_ALREADY_RUN = 'BALLOT_ALREADY_RUN',
    BALLOT_NOT_FOUND = 'BALLOT_NOT_FOUND',
    BALLOT_ALREADY_APPROVED = 'BALLOT_ALREADY_APPROVED',

    // Hostel / Room
    HOSTEL_NOT_FOUND = 'HOSTEL_NOT_FOUND',
    ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
    SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
    SESSION_NOT_ACTIVE = 'SESSION_NOT_ACTIVE',

    // General
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DB_ERROR = 'DB_ERROR',
}

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: ErrorCode;
    public readonly details?: unknown;

    constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }

    static badRequest(code: ErrorCode, message: string, details?: unknown) {
        return new AppError(400, code, message, details);
    }

    static unauthorized(message = 'Unauthorized') {
        return new AppError(401, ErrorCode.AUTH_UNAUTHORIZED, message);
    }

    static forbidden(message = 'Forbidden') {
        return new AppError(403, ErrorCode.AUTH_FORBIDDEN, message);
    }

    static notFound(code: ErrorCode, message: string) {
        return new AppError(404, code, message);
    }

    static conflict(code: ErrorCode, message: string) {
        return new AppError(409, code, message);
    }

    static internal(message = 'Internal server error') {
        return new AppError(500, ErrorCode.INTERNAL_ERROR, message);
    }
}
