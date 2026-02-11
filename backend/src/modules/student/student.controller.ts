// ============================================================
// Student Controller — Minimal, task-oriented
// ============================================================
import { Response, NextFunction } from 'express';
import { studentService } from './student.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export class StudentController {
    /** POST /api/student/apply */
    async apply(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const application = await studentService.applyForHostel(req.user!.id, req.body);
            sendCreated(res, application, 'Application submitted successfully');
        } catch (err) {
            next(err);
        }
    }

    /** POST /api/student/upload-receipt */
    async uploadReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'No file uploaded', timestamp: new Date().toISOString() },
                });
                return;
            }
            const result = await studentService.uploadReceipt(req.user!.id, req.file);
            sendSuccess(res, result, 'Receipt uploaded successfully');
        } catch (err) {
            next(err);
        }
    }

    /** GET /api/student/status */
    async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const status = await studentService.getStatus(req.user!.id);
            sendSuccess(res, status);
        } catch (err) {
            next(err);
        }
    }

    /** GET /api/student/allocation */
    async getAllocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const allocation = await studentService.getAllocation(req.user!.id);
            sendSuccess(res, allocation);
        } catch (err) {
            next(err);
        }
    }
}

export const studentController = new StudentController();
