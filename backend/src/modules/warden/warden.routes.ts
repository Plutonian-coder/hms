// ============================================================
// Warden Routes
// ============================================================
import { Router } from 'express';
import { wardenController } from './warden.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { checkInOutSchema } from '../../utils/validators';

const router = Router();

// All warden routes require auth + warden role
router.use(authMiddleware, requireRole('warden', 'admin'));

// GET /api/warden/hostels — assigned hostels
router.get('/hostels', wardenController.getHostels);

// GET /api/warden/hostels/:id/rooms — room occupancy
router.get('/hostels/:id/rooms', wardenController.getRoomOccupancy);

// POST /api/warden/check-in
router.post('/check-in', validate(checkInOutSchema), wardenController.checkIn);

// POST /api/warden/check-out
router.post('/check-out', validate(checkInOutSchema), wardenController.checkOut);

export default router;
