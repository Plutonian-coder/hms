// ============================================================
// Public Controller — No authentication required
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { publicService } from './public.service';
import { sendSuccess } from '../../utils/response';

export class PublicController {
    /** GET /api/public/allocation/:matric_number */
    async getAllocationByMatric(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await publicService.getAllocationByMatric(req.params.matric_number);
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    /** GET /api/public/application-status?matric=XXX&surname=YYY */
    async getApplicationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const matric = req.query.matric as string;
            const surname = req.query.surname as string;

            if (!matric || !surname) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Both "matric" and "surname" query parameters are required',
                        timestamp: new Date().toISOString(),
                    },
                });
                return;
            }

            const result = await publicService.getApplicationStatus(matric, surname);
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    /** GET /api/public/hostels — list active hostels (no auth required) */
    async getHostels(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await publicService.getHostels();
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }
}

export const publicController = new PublicController();
