// ============================================================
// Auth Controller
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.register(req.body);
            sendCreated(res, result, 'Registration successful');
        } catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            sendSuccess(res, result, 'Login successful');
        } catch (err) {
            next(err);
        }
    }

    async studentLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { matric_number, surname } = req.body;
            const result = await authService.studentLogin(matric_number, surname);
            sendSuccess(res, result, 'Login successful');
        } catch (err) {
            next(err);
        }
    }

    async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const profile = await authService.getProfile(req.user!.id);
            sendSuccess(res, { profile });
        } catch (err) {
            next(err);
        }
    }
}

export const authController = new AuthController();
