# Unified Deployment Guide

## Overview
The frontend (Remix) and backend (Express API) have been merged into a single service. This allows you to:
- Deploy as one service on Render.com
- Use a single ping endpoint to keep the service alive
- Avoid cold starts by pinging just one URL

## ⚠️ IMPORTANT: How to Run the Server

**ALWAYS run the Express server, NOT remix-serve:**

```bash
# ✅ CORRECT - Run from backend directory
cd Haus_Of_Lewks_API
npm start

# ❌ WRONG - Do NOT run remix-serve directly
cd BookingWebApp
npm start  # This bypasses Express and breaks API routes!
```

## How It Works

The Express server (`Haus_Of_Lewks_API/src/server.js`) is the **single entry point** that:
1. Handles API routes via Express (`/api/v1/*`)
2. Serves static assets (`/assets/*`)
3. Handles all other routes via Remix (frontend pages)

**Route order matters:**
```
Request → Express middleware → API routes (/api/*) → Remix handler (everything else)
```

## Changes Made

### 1. Frontend Configuration (`BookingWebApp/app/config/config.js`)
- Updated `getApiUrl()` to use relative URLs (`/api/v1`) instead of hardcoded localhost
- Works seamlessly when frontend and backend are on the same origin

### 2. Backend Server (`Haus_Of_Lewks_API/src/config/app.js`)
- Integrated Remix via `@remix-run/express`
- Express API routes are registered BEFORE the Remix handler
- Remix handles only non-API routes with `app.all("*", remixHandler)`
- Added `/ping` health check endpoint

### 3. Package Configuration (`Haus_Of_Lewks_API/package.json`)
- Added `@remix-run/express` dependency
- Added build scripts:
  - `build`: Builds frontend and prepares for deployment
  - `build:frontend`: Builds only the frontend
  - `dev`: Builds frontend and starts server

## Deployment on Render.com

### Build Command
```bash
cd Haus_Of_Lewks_API && npm install && npm run build
```

### Start Command
```bash
cd Haus_Of_Lewks_API && npm start
```

### Environment Variables
Make sure to set all required environment variables in Render:
- `MONGODB_URL`
- `BASE_PATH` (e.g., `/api/v1`)
- `FRONTEND_URL` (your Render URL)
- `CRM_FRONTEND_URL` (if applicable)
- `PORT` (Render sets this automatically)
- `JWT_SECRET`
- `SIGNUP_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `DO_SPACES_KEY`
- `DO_SPACES_SECRET`
- `DO_BUCKET_NAME`
- `NODE_ENV=production`

### Keeping Service Alive (Free Plan)
To prevent cold starts on Render's free plan, set up an external ping service:

1. **Use a free cron service** like [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com)
2. **Ping your service** every 10-14 minutes at: `https://your-app.onrender.com/ping`
3. The `/ping` endpoint returns: `{ status: 'ok', timestamp: '...' }`

## Project Structure
```
HausOfLewks/
├── BookingWebApp/          # Frontend (Remix)
│   ├── app/
│   └── build/             # Built frontend (generated)
└── Haus_Of_Lewks_API/      # Backend (Express) - Main entry point
    ├── src/
    │   ├── config/
    │   │   └── app.js      # Unified server (serves both API and Remix)
    │   └── server.js       # Entry point
    └── package.json        # Unified package.json
```

## Development

### Local Development
1. Build the frontend:
   ```bash
   cd BookingWebApp
   npm install
   npm run build
   ```

2. Start the backend (which now serves the frontend):
   ```bash
   cd Haus_Of_Lewks_API
   npm install
   npm start
   ```

3. Access the app at `http://localhost:3000`

### API Endpoints
- API routes: `http://localhost:3000/api/v1/...`
- Health check: `http://localhost:3000/ping`
- Frontend routes: All other routes are handled by Remix

## Notes
- The frontend build must exist before starting the server
- If the Remix build is missing, the server will still start but won't serve the frontend
- CORS is configured to allow same-origin requests (no CORS needed for same-origin)
- Static assets are cached for 1 year for optimal performance

