// ============================================================
// Auth Routes
// ============================================================
import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema, studentLoginSchema } from '../../utils/validators';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/student-login
router.post('/student-login', validate(studentLoginSchema), authController.studentLogin);

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, authController.me);

export default router;
