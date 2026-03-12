# ✅ .env File Created! Next Steps

## Good News!

✅ The `.env` file exists! Your Supabase credentials are configured.

## Why You're Still Getting 400 Error

The `.env` file exists, but you need to:

### 1. Restart Backend Server ⚠️ CRITICAL

The backend server needs to be restarted to load the `.env` file:

1. **Find the terminal** where backend is running
2. **Press `Ctrl+C`** to stop it
3. **Start it again**:
   ```powershell
   cd backend
   npm run dev
   ```

**What to look for:**
- ✅ Should NOT see: "WARNING: Supabase credentials not configured"
- ✅ Should see: "🚀 Aurora Sentinel Backend running on port 3001"
- ✅ No errors about missing credentials

### 2. Run Database Schema

The database tables need to be created:

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**
3. **Click**: "SQL Editor" (left sidebar)
4. **Click**: "New Query"
5. **Open**: `backend/src/db/schema.sql`
6. **Copy ALL contents** (the entire file - 98 lines)
7. **Paste** into Supabase SQL Editor
8. **Click**: "Run" button (or press `Ctrl+Enter`)

**Verify tables created:**
- Go to "Table Editor" in Supabase
- Should see 5 tables: `users`, `otp_codes`, `sos_events`, `risk_snapshots`, `security_actions`

### 3. Check the Actual Error Message

To see what's wrong:

1. **Open Developer Tools**: Press `F12`
2. **Go to Network tab**
3. **Try registering** (submit the form)
4. **Find**: `/api/auth/register` request (usually red)
5. **Click it**
6. **Go to "Response" tab** (or "Preview" tab)
7. **Read the error message**

**Common errors you might see:**
- "relation 'users' does not exist" → Database schema not run
- "Failed to create user: ..." → Check the specific error
- Database connection error → Check .env credentials

## Quick Checklist

- [x] ✅ .env file created
- [ ] ⚠️ Backend server restarted?
- [ ] ⚠️ Database schema run in Supabase?
- [ ] ⚠️ Checked error message in Network tab?

## After Completing Steps 1 & 2

Try registering again at: http://localhost:3000

**It should work now!** 🚀

---

**The .env file is done - now restart backend and run the schema!**
