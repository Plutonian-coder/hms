// ============================================================
// Admin Controller
// ============================================================
import { Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { sendSuccess, sendCreated } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';

export class AdminController {
    // Payment
    async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { application_id, verified, notes } = req.body;
            const result = await adminService.verifyPayment(req.user!.id, application_id, verified, notes);
            sendSuccess(res, result, verified ? 'Payment verified' : 'Payment unverified');
        } catch (err) { next(err); }
    }

    async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminService.getApplications(req.query as any);
            sendSuccess(res, result);
        } catch (err) { next(err); }
    }

    async getBallotConfig(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminService.getBallotConfig(req.query.session_id as string);
            sendSuccess(res, result);
        } catch (err) { next(err); }
    }

    async getBallotHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminService.getBallotHistory(req.query.session_id as string);
            sendSuccess(res, result);
        } catch (err) { next(err); }
    }

    // Ballot
    async configureBallot(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const config = await adminService.configureBallot(req.user!.id, req.body);
            sendCreated(res, config, 'Ballot configured successfully');
        } catch (err) { next(err); }
    }

    async runBallot(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminService.runBallot(req.user!.id, req.body.session_id);
            sendSuccess(res, result, 'Ballot completed');
        } catch (err) { next(err); }
    }

    async approveBallot(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminService.approveBallot(req.user!.id, req.params.id, req.body.approved);
            sendSuccess(res, result, req.body.approved ? 'Ballot approved' : 'Ballot rejected');
        } catch (err) { next(err); }
    }

    // Manual allocation
    async manualAllocate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await adminService.manualAllocate(req.user!.id, req.body);
            sendCreated(res, result, 'Allocation created');
        } catch (err) { next(err); }
    }

    // Hostel CRUD
    async createHostel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const hostel = await adminService.createHostel(req.body);
            sendCreated(res, hostel, 'Hostel created');
        } catch (err) { next(err); }
    }

    async getHostels(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const hostels = await adminService.getHostels();
            sendSuccess(res, hostels);
        } catch (err) { next(err); }
    }

    async updateHostel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const hostel = await adminService.updateHostel(req.params.id, req.body);
            sendSuccess(res, hostel, 'Hostel updated');
        } catch (err) { next(err); }
    }

    async deleteHostel(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await adminService.deleteHostel(req.params.id);
            sendSuccess(res, null, 'Hostel deleted');
        } catch (err) { next(err); }
    }

    // Room CRUD
    async createRoom(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const room = await adminService.createRoom(req.params.hostelId, req.body);
            sendCreated(res, room, 'Room created');
        } catch (err) { next(err); }
    }

    async getRooms(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const rooms = await adminService.getRooms(req.params.hostelId);
            sendSuccess(res, rooms);
        } catch (err) { next(err); }
    }

    async updateRoom(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const room = await adminService.updateRoom(req.params.roomId, req.body);
            sendSuccess(res, room, 'Room updated');
        } catch (err) { next(err); }
    }

    async deleteRoom(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await adminService.deleteRoom(req.params.roomId);
            sendSuccess(res, null, 'Room deleted');
        } catch (err) { next(err); }
    }

    async getRoomOccupants(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const occupants = await adminService.getRoomOccupants(req.params.roomId);
            sendSuccess(res, occupants);
        } catch (err) { next(err); }
    }

    // Sessions
    async createSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const session = await adminService.createSession(req.body);
            sendCreated(res, session, 'Session created');
        } catch (err) { next(err); }
    }

    async getSessions(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const sessions = await adminService.getSessions();
            sendSuccess(res, sessions);
        } catch (err) { next(err); }
    }

    async updateSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const session = await adminService.updateSession(req.params.id, req.body);
            sendSuccess(res, session, 'Session updated');
        } catch (err) { next(err); }
    }

    // Warden assignment
    async assignWarden(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { warden_id, hostel_id } = req.body;
            const result = await adminService.assignWarden(req.user!.id, warden_id, hostel_id);
            sendSuccess(res, result, 'Warden assigned');
        } catch (err) { next(err); }
    }

    // Bulk Auto-Assign (prdedit.md requirement)
    async bulkAutoAssign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { student_ids, session_id, allocation_mode } = req.body;
            const result = await adminService.bulkAutoAssign(req.user!.id, student_ids, session_id, allocation_mode);
            sendSuccess(res, result, `${result.allocated_count} students allocated successfully`);
        } catch (err) { next(err); }
    }

    // Analytics
    async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await adminService.getDashboardStats(req.query.session_id as string);
            sendSuccess(res, stats);
        } catch (err) { next(err); }
    }

    // Students
    async getStudents(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const students = await adminService.getAllStudents();
            sendSuccess(res, students);
        } catch (err) { next(err); }
    }
}

export const adminController = new AdminController();
