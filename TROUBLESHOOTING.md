# 🔧 Troubleshooting "fetch failed" Error

## Current Status ✅
- ✅ Backend is running (port 3001)
- ✅ Frontend is running (port 3000)
- ✅ API configuration fixed
- ✅ Proxy configured correctly

## Steps to Fix

### 1. Hard Refresh Browser (IMPORTANT!)
The most common cause is cached JavaScript. Do a **hard refresh**:

- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 2. Clear Browser Cache
If hard refresh doesn't work:
1. Press `F12` to open Developer Tools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 3. Check Browser Console
1. Press `F12` to open Developer Tools
2. Go to the **Console** tab
3. Look for error messages - they'll show the exact issue
4. Check the **Network** tab - see if requests to `/api/auth/register` are being made

### 4. Try Incognito/Private Window
Open a new incognito/private window and try:
- `http://localhost:3000`

This bypasses all cache.

## Expected Behavior After Fix

✅ **Before**: "TypeError: fetch failed"  
✅ **After**: Either:
- Success message (if database configured)
- Database connection error (expected until Supabase is configured)
- Validation error (different error, means connection works!)

## Verify the Fix Worked

After refreshing, check the Network tab (F12 → Network):
- You should see requests to `/api/auth/register`
- Status should be 200, 400, or 500 (NOT "failed" or CORS error)
- If you see a 400 or 500, the connection is working!

## Still Not Working?

1. **Close and reopen browser** completely
2. **Check both servers are running**:
   - Backend: http://localhost:3001/health (should show {"status":"ok"})
   - Frontend: http://localhost:3000 (should show the app)
3. **Check firewall** - make sure ports 3000 and 3001 aren't blocked
4. **Try different browser** (Chrome, Firefox, Edge)

## Quick Test

Open a new tab and go to:
- `http://localhost:3001/health` - Should show: `{"status":"ok",...}`
- `http://localhost:3000` - Should show the app

If both work, the issue is browser cache!

---

**Most likely solution: Hard refresh (Ctrl+Shift+R)!** 🔄
