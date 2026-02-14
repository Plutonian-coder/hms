# YABATECH Hostel Management System — Backend API

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend   │────▶│  Express API     │────▶│  Supabase        │
│   (Any)      │     │  (Node.js/TS)    │     │  PostgreSQL      │
└─────────────┘     │                  │     │  Auth / Storage  │
                    │  JWT Middleware   │     └──────────────────┘
                    │  RBAC Middleware  │
                    │  Zod Validation   │
                    └──────────────────┘
```

**Stack:** Express (TypeScript), Supabase (PostgreSQL + Auth + Storage), Zod validation

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))

### 2. Install

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Run database migrations

Go to the Supabase SQL Editor and run these files **in order**:
1. `supabase/migrations/001_init.sql`
2. `supabase/rls/rls_policies.sql`

### 5. Start the server

```bash
npm run dev
```

Server starts at `http://localhost:4000`

---

## API Endpoints

### Health Check
```bash
curl http://localhost:4000/api/health
```

### 🔓 Public

```bash
# Lookup allocation by matric number
curl http://localhost:4000/api/public/allocation/YABATECH%2F2024%2FND%2FCSC%2F001
```

### 🔐 Auth

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@yabatech.edu.ng",
    "password": "SecureP@ss1",
    "first_name": "John",
    "last_name": "Doe",
    "matric_number": "YABATECH/2024/ND/CSC/001",
    "gender": "male",
    "level": 100,
    "department": "Computer Science"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@yabatech.edu.ng", "password": "SecureP@ss1"}'

# Get profile (use access_token from login)
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 🎓 Student (requires student JWT)

```bash
TOKEN="<student_access_token>"

# Apply for hostel
curl -X POST http://localhost:4000/api/student/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_choice_hostel_id": "<hostel_uuid>",
    "second_choice_hostel_id": "<hostel_uuid>",
    "third_choice_hostel_id": "<hostel_uuid>"
  }'

# Upload payment receipt
curl -X POST http://localhost:4000/api/student/applications/<app_id>/receipt \
  -H "Authorization: Bearer $TOKEN" \
  -F "receipt=@/path/to/receipt.pdf"

# List applications
curl http://localhost:4000/api/student/applications \
  -H "Authorization: Bearer $TOKEN"

# View single application
curl http://localhost:4000/api/student/applications/<app_id> \
  -H "Authorization: Bearer $TOKEN"

# View allocation details
curl http://localhost:4000/api/student/allocations \
  -H "Authorization: Bearer $TOKEN"
```

### 🛡 Admin (requires admin JWT)

```bash
TOKEN="<admin_access_token>"

# ---- Sessions ----
curl -X POST http://localhost:4000/api/admin/sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2024/2025",
    "start_date": "2024-09-01",
    "end_date": "2025-07-31",
    "application_start_date": "2024-08-01T00:00:00Z",
    "application_end_date": "2024-08-31T23:59:59Z",
    "is_active": true
  }'

# ---- Hostels ----
curl -X POST http://localhost:4000/api/admin/hostels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bakassi Hall", "gender": "male", "description": "Male hostel block A"}'

# ---- Rooms ----
curl -X POST http://localhost:4000/api/admin/hostels/<hostel_id>/rooms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"room_number": "B101", "floor_number": 1, "capacity": 4, "room_type": "standard"}'

# ---- List applications ----
curl "http://localhost:4000/api/admin/applications?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# ---- Verify payment ----
curl -X PATCH http://localhost:4000/api/admin/applications/<app_id>/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"application_id": "<app_id>", "verified": true, "notes": "Receipt confirmed"}'

# ---- Configure ballot ----
curl -X POST http://localhost:4000/api/admin/ballot/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "<session_id>",
    "payment_weight": 0.50,
    "category_weight": 0.30,
    "level_weight": 0.20,
    "fresh_student_score": 100,
    "final_year_score": 90,
    "level_300_score": 70,
    "level_200_score": 60
  }'

# ---- Run ballot ----
curl -X POST http://localhost:4000/api/admin/ballot/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "<session_id>", "confirm": true}'

# ---- Approve ballot ----
curl -X POST http://localhost:4000/api/admin/ballot/<ballot_run_id>/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'

# ---- Manual allocation ----
curl -X POST http://localhost:4000/api/admin/allocations/override \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "<student_uuid>",
    "room_id": "<room_uuid>",
    "session_id": "<session_uuid>",
    "bed_space_number": 1,
    "reason": "Special accommodation request"
  }'

# ---- Dashboard analytics ----
curl http://localhost:4000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"

# ---- Assign warden ----
curl -X POST http://localhost:4000/api/admin/wardens/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"warden_id": "<warden_uuid>", "hostel_id": "<hostel_uuid>"}'
```

### 🏠 Warden (requires warden JWT)

```bash
TOKEN="<warden_access_token>"

# View assigned hostels
curl http://localhost:4000/api/warden/hostels \
  -H "Authorization: Bearer $TOKEN"

# View room occupancy
curl http://localhost:4000/api/warden/hostels/<hostel_id>/rooms \
  -H "Authorization: Bearer $TOKEN"

# Check-in student
curl -X POST http://localhost:4000/api/warden/check-in \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"allocation_id": "<allocation_uuid>", "notes": "Student arrived"}'

# Check-out student
curl -X POST http://localhost:4000/api/warden/check-out \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"allocation_id": "<allocation_uuid>", "notes": "End of session"}'
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "timestamp": "2024-08-20T14:22:15.000Z",
    "details": []
  }
}
```

---

## Project Structure

```
backend/
├── src/
│   ├── app.ts                  # Express setup, middleware, routes
│   ├── server.ts               # Entry point
│   ├── config/
│   │   ├── index.ts            # Env config loader
│   │   └── supabase.ts         # Supabase client factory
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── role.middleware.ts   # RBAC enforcement
│   │   ├── validate.middleware.ts # Zod validation
│   │   └── error.middleware.ts  # Global error handler
│   ├── modules/
│   │   ├── auth/               # Register, login, profile
│   │   ├── student/            # Apply, upload receipt, view allocation
│   │   ├── admin/              # Payments, ballot, CRUD, analytics
│   │   ├── warden/             # Check-in/out, room occupancy
│   │   └── public/             # Allocation lookup by matric
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── utils/
│       ├── errors.ts           # AppError class + error codes
│       ├── response.ts         # Standard response helpers
│       └── validators.ts       # Zod schemas
├── package.json
├── tsconfig.json
└── .env.example

supabase/
├── migrations/
│   └── 001_init.sql            # Tables, triggers, functions
└── rls/
    └── rls_policies.sql        # Row Level Security
```

---

## Deploying to Render

### Prerequisites
- A [Render](https://render.com) account
- A [Supabase](https://supabase.com) project with the database migrations run

### Deploy Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment configuration"
   git push origin main
   ```

2. **Create a Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure the following settings:
     - **Name**: `hms-backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install --include=dev && npm run build` (CRITICAL: Install dev deps for TypeScript!)
     - **Start Command**: `node dist/server.js`
     - **Plan**: `Free` (or paid as needed)

3. **Set Environment Variables**
   In the Render dashboard, add these environment variables:
   ```
   NODE_ENV=production
   PORT=4000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_secure_jwt_secret
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (it will run `npm install` and then `npm run build` via the `postinstall` script)

### Troubleshooting

If the build fails with TypeScript errors like "Cannot find module 'express'":

1. Make sure your `package.json` includes `@types/express` in `devDependencies`
2. Ensure the build command runs `npm install` (not `npm ci --only=production`)
3. The `postinstall` script ensures TypeScript compiles after dependencies install

If you see "Cannot find name 'process'":
- Install `@types/node` in devDependencies (already included in this project)
```
