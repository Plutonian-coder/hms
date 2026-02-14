# YABATECH HMS — Deployment Guide

This project is a monorepo with two deployable services:

| Service  | Directory       | Hosting  | URL Pattern                          |
|----------|-----------------|----------|--------------------------------------|
| Backend  | `backend/`      | Render   | `https://<app>.onrender.com`         |
| Frontend | `frontend_new/` | Vercel   | `https://<app>.vercel.app`           |

---

## 1. Backend — Deploy to Render

### 1.1 Create the Service

1. Go to https://dashboard.render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting           | Value                     |
|-------------------|---------------------------|
| **Name**          | `hms` (or anything)       |
| **Root Directory**| `backend`                 |
| **Runtime**       | `Node`                    |
| **Build Command** | `npm install --include=dev && npx tsc` |
| **Start Command** | `node dist/server.js`     |

> **Do NOT set a custom `PORT` env var.** Render assigns its own port
> automatically via `process.env.PORT`. The backend code already reads it:
> `parseInt(process.env.PORT || '4000', 10)`.

### 1.2 Environment Variables on Render

Go to **Environment** tab and add these:

| Key                        | Value                                    | Notes                         |
|----------------------------|------------------------------------------|-------------------------------|
| `SUPABASE_URL`             | `https://xxxx.supabase.co`               | From Supabase dashboard       |
| `SUPABASE_ANON_KEY`        | `eyJ...`                                 | From Supabase → API settings  |
| `SUPABASE_SERVICE_ROLE_KEY`| `eyJ...`                                 | From Supabase → API settings  |
| `JWT_SECRET`               | any strong random string                 | e.g. `openssl rand -hex 32`   |
| `CORS_ORIGINS`             | `https://<your-app>.vercel.app`          | **No trailing slash!**        |
| `NODE_ENV`                 | `production`                             | Optional but recommended      |

**CORS_ORIGINS rules:**
- Must be the exact origin: `https://hms-ten-xi.vercel.app`
- No trailing slash (`https://hms-ten-xi.vercel.app/` = WRONG)
- No spaces
- For multiple origins, comma-separate: `https://hms-ten-xi.vercel.app,http://localhost:3000`

### 1.3 Verify Backend is Live

After Render deploys, open this URL in your browser:

```
https://<your-app>.onrender.com/api/health
```

You should see:
```json
{"success":true,"data":{"status":"healthy","timestamp":"...","version":"1.0.0"}}
```

If you get no response or a timeout, check:
- Render logs for startup errors
- Free tier services sleep after 15 min of inactivity — first request takes ~30-60s

---

## 2. Frontend — Deploy to Vercel

### 2.1 Create the Project

1. Go to https://vercel.com → **Add New Project**
2. Import your GitHub repo
3. Configure:

| Setting            | Value            |
|--------------------|------------------|
| **Framework**      | Next.js          |
| **Root Directory** | `frontend_new`   |

Leave Build Command, Output Directory, and Install Command as defaults.

### 2.2 Environment Variables on Vercel

Go to **Settings → Environment Variables** and add:

| Key                          | Value                                      | Notes                          |
|------------------------------|--------------------------------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL`        | `https://<your-app>.onrender.com/api`      | **Include `/api` at the end!** |
| `NEXT_PUBLIC_SUPABASE_URL`   | `https://xxxx.supabase.co`                 | Same as backend                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`                                | Same as backend                |

**Critical: `NEXT_PUBLIC_` vars are baked in at BUILD TIME.**
After adding or changing any `NEXT_PUBLIC_` variable, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**

### 2.3 Verify Frontend

Open `https://<your-app>.vercel.app` and check the browser console (F12):
- No CORS errors
- API calls go to `https://<your-app>.onrender.com/api/...` (not `localhost`)

---

## 3. Troubleshooting Checklist

### CORS errors in browser console

| Check | Fix |
|-------|-----|
| `CORS_ORIGINS` not set on Render | Add it in Render → Environment |
| Trailing slash in `CORS_ORIGINS` | Remove it: `https://app.vercel.app` not `https://app.vercel.app/` |
| `http` instead of `https` | Must be `https://` for deployed sites |
| Render didn't redeploy | Env var changes auto-trigger redeploy — check Render Events tab |

### `net::ERR_FAILED` with no CORS error

| Check | Fix |
|-------|-----|
| Backend is sleeping (free tier) | Visit `/api/health` to wake it up, wait 30-60s |
| Wrong `NEXT_PUBLIC_API_URL` | Must be `https://<app>.onrender.com/api` |
| Forgot to redeploy Vercel after adding env var | Redeploy from Deployments tab |
| Custom `PORT` env var on Render | **Delete it** — let Render assign its own |

### Backend crashes on startup

| Check | Fix |
|-------|-----|
| Missing env var | Check Render logs — the app throws on missing required vars |
| Build command wrong | Must be `npm install --include=dev && npx tsc` |
| Start command wrong | Must be `node dist/server.js` |

---

## 4. Architecture Overview

```
Browser (user)
    │
    ▼
Vercel (frontend_new/)
  Next.js static site
  reads NEXT_PUBLIC_API_URL at build time
    │
    │  fetch("https://<app>.onrender.com/api/auth/login")
    ▼
Render (backend/)
  Express.js API
  reads CORS_ORIGINS to allow Vercel domain
  reads PORT from Render (auto-assigned)
    │
    ▼
Supabase
  PostgreSQL + Auth + Storage
```

---

## 5. Quick Deploy Reset (Start Fresh)

If things are broken, do a clean reset:

### On Render:
1. Delete the service
2. Create a new Web Service with the settings from Section 1.1
3. Add env vars from Section 1.2 — **do NOT add `PORT`**
4. Wait for deploy to finish
5. Test: `https://<new-url>.onrender.com/api/health`

### On Vercel:
1. Delete the project
2. Re-import from GitHub with settings from Section 2.1
3. Add env vars from Section 2.2 — use the **new Render URL** for `NEXT_PUBLIC_API_URL`
4. Deploy
5. Test the login page
