// ============================================================
// Student Routes — Exactly 4 task-oriented endpoints
// ============================================================
import { Router } from 'express';
import multer from 'multer';
import { studentController } from './student.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createApplicationSchema } from '../../utils/validators';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
        }
    },
});

// All student routes require auth + student role
router.use(authMiddleware, requireRole('student'));

// POST /api/student/apply — submit hostel application
router.post('/apply', validate(createApplicationSchema), studentController.apply);

// POST /api/student/upload-receipt — upload payment receipt (auto-finds current application)
router.post('/upload-receipt', upload.single('receipt'), studentController.uploadReceipt);

// GET /api/student/status — computed application status (can be checked days later)
router.get('/status', studentController.getStatus);

// GET /api/student/allocation — read-only allocation result with roommates
router.get('/allocation', studentController.getAllocation);

export default router;
