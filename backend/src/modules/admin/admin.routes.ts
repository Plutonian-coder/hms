// ============================================================
// Admin Routes
// ============================================================
import { Router } from 'express';
import { adminController } from './admin.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
    verifyPaymentSchema,
    ballotConfigSchema,
    runBallotSchema,
    approveBallotSchema,
    manualAllocationSchema,
    createHostelSchema,
    updateHostelSchema,
    createRoomSchema,
    updateRoomSchema,
    createSessionSchema,
    wardenAssignmentSchema,
    bulkAutoAssignSchema,
} from '../../utils/validators';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, requireRole('admin'));

// ---- Applications ----
router.get('/applications', adminController.getApplications);

// ---- Payment Verification ----
router.patch('/applications/:id/verify', validate(verifyPaymentSchema), adminController.verifyPayment);

// ---- Ballot ----
router.get('/ballot/config', adminController.getBallotConfig);
router.get('/ballot/history', adminController.getBallotHistory);
router.post('/ballot/config', validate(ballotConfigSchema), adminController.configureBallot);
router.post('/ballot/run', validate(runBallotSchema), adminController.runBallot);
router.post('/ballot/:id/approve', validate(approveBallotSchema), adminController.approveBallot);

// ---- Manual Allocation ----
router.post('/allocations/override', validate(manualAllocationSchema), adminController.manualAllocate);

// ---- Bulk Auto-Assign (prdedit.md) ----
router.post('/allocations/bulk-auto-assign', validate(bulkAutoAssignSchema), adminController.bulkAutoAssign);

// ---- Hostel CRUD ----
router.post('/hostels', validate(createHostelSchema), adminController.createHostel);
router.get('/hostels', adminController.getHostels);
router.patch('/hostels/:id', validate(updateHostelSchema), adminController.updateHostel);
router.delete('/hostels/:id', adminController.deleteHostel);

// ---- Room CRUD ----
router.post('/hostels/:hostelId/rooms', validate(createRoomSchema), adminController.createRoom);
router.get('/hostels/:hostelId/rooms', adminController.getRooms);
router.patch('/rooms/:roomId', validate(updateRoomSchema), adminController.updateRoom);
router.delete('/rooms/:roomId', adminController.deleteRoom);
router.get('/rooms/:roomId/occupants', adminController.getRoomOccupants);

// ---- Sessions ----
router.post('/sessions', validate(createSessionSchema), adminController.createSession);
router.get('/sessions', adminController.getSessions);
router.patch('/sessions/:id', adminController.updateSession);

// ---- Wardens ----
router.post('/wardens/assign', validate(wardenAssignmentSchema), adminController.assignWarden);

// ---- Analytics ----
router.get('/dashboard', adminController.getDashboard);

// ---- Students ----
router.get('/students', adminController.getStudents);

export default router;
