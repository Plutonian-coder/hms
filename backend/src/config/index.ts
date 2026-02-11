import dotenv from 'dotenv';
dotenv.config();

export const config = {
    supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    jwt: {
        secret: process.env.JWT_SECRET || '',
    },
    server: {
        port: parseInt(process.env.PORT || '4000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    },
} as const;

// Validate required env vars on startup
const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
] as const;

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
