// ============================================================
// Warden Controller
// ============================================================
import { Response, NextFunction } from 'express';
import { wardenService } from './warden.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export class WardenController {
    async getHostels(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const hostels = await wardenService.getAssignedHostels(req.user!.id);
            sendSuccess(res, hostels);
        } catch (err) { next(err); }
    }

    async getRoomOccupancy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const rooms = await wardenService.getRoomOccupancy(req.user!.id, req.params.id);
            sendSuccess(res, rooms);
        } catch (err) { next(err); }
    }

    async checkIn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await wardenService.checkIn(req.user!.id, req.body.allocation_id, req.body.notes);
            sendSuccess(res, result, 'Student checked in');
        } catch (err) { next(err); }
    }

    async checkOut(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await wardenService.checkOut(req.user!.id, req.body.allocation_id, req.body.notes);
            sendSuccess(res, result, 'Student checked out');
        } catch (err) { next(err); }
    }
}

export const wardenController = new WardenController();
