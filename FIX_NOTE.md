# 🔧 Fix Applied: API Configuration

## Issue
The frontend was trying to connect directly to `http://localhost:3001/api` instead of using the Vite proxy configured at `/api`.

## Solution
Updated `frontend/src/services/api.ts` to use relative URLs (`/api`) in development, which allows Vite's proxy to forward requests to the backend server.

## What Changed
- Changed API base URL to use relative path `/api` by default
- This uses Vite's proxy configuration in `vite.config.ts`
- Proxy forwards `/api/*` requests to `http://localhost:3001`

## Next Steps
1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Ctrl+F5)
2. The registration form should now work properly
3. The backend will still need database configuration for full functionality

## Note
The backend is running and responding. The error you saw was because the frontend couldn't reach it. This is now fixed!

---

**Please refresh your browser to see the changes!**
