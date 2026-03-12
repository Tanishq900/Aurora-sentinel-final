# 🔧 Port 3001 Already in Use - Fix

## The Problem

**Error**: `EADDRINUSE: address already in use :::3001`

**Cause**: The backend server is already running from before. You can't start a second instance on the same port.

## Solution: Stop the Old Process

### Method 1: Find and Kill Process (Automated)

I'll help you find and stop it.

### Method 2: Manual (If Method 1 doesn't work)

1. **Find the terminal** where backend was running before
2. **Press `Ctrl+C`** in that terminal
3. **Wait a few seconds**
4. **Try starting again**: `cd backend && npm run dev`

### Method 3: Kill All Node Processes (Nuclear Option)

If you can't find the terminal:

```powershell
# Stop all Node.js processes
Get-Process node | Stop-Process -Force
```

⚠️ **Warning**: This stops ALL Node.js processes (frontend too!)

Then restart:
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`

## After Stopping Old Process

1. **Start backend again**:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Check output**:
   - Should see: "🚀 Aurora Sentinel Backend running on port 3001"
   - Should NOT see: "WARNING: Supabase credentials not configured"

3. **Test registration** again!

---

**The old backend is still running - stop it first, then restart!** 🔄
