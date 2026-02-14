// ============================================================
// Express Application Setup
// ============================================================
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import studentRoutes from './modules/student/student.routes';
import adminRoutes from './modules/admin/admin.routes';
import wardenRoutes from './modules/warden/warden.routes';
import publicRoutes from './modules/public/public.routes';

const app = express();

// ---- Global Middleware ----

// CORS must come before helmet so preflight requests get proper headers
const corsOptions = {
    origin: config.server.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ---- Health Check ----
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        },
    });
});

// ---- Route Mounting ----
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/public', publicRoutes);

// ---- 404 Handler ----
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found',
            timestamp: new Date().toISOString(),
        },
    });
});

// ---- Global Error Handler ----
app.use(errorHandler);

export default app;
