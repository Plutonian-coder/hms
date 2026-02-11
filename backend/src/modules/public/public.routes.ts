// ============================================================
// Public Routes — No authentication required
// ============================================================
import { Router } from 'express';
import { publicController } from './public.controller';

const router = Router();

// GET /api/public/hostels — list active hostels (no auth required)
router.get('/hostels', publicController.getHostels);

// GET /api/public/allocation/:matric_number — allocation lookup
router.get('/allocation/:matric_number', publicController.getAllocationByMatric);

// GET /api/public/application-status?matric=XXX&surname=YYY — status lookup (no login)
router.get('/application-status', publicController.getApplicationStatus);

export default router;
