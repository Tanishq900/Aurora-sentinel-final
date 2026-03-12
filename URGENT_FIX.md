# ⚠️ URGENT: You're Missing the .env File!

## The Problem

You're getting a 400 error because the backend doesn't have your Supabase credentials.

## The Solution (2 Steps)

### Step 1: Create backend/.env File

**Your credentials are ready in**: `backend/ENV_SETUP.txt`

**Do this:**
1. Open `backend/ENV_SETUP.txt` in your editor
2. Select ALL text (Ctrl+A)
3. Copy it (Ctrl+C)
4. Create a NEW file named `.env` in the `backend` folder
   - ⚠️ IMPORTANT: Name it `.env` (starts with a dot, no extension!)
   - NOT `env.txt` or `.env.txt` - just `.env`
5. Paste the content (Ctrl+V)
6. Save the file

**File location**: `C:\Users\jeetp\aurora-sentinel\backend\.env`

### Step 2: Restart Backend Server

1. Go to terminal where backend is running
2. Press `Ctrl+C` to stop it
3. Start it again:
   ```powershell
   cd backend
   npm run dev
   ```
4. You should NOT see Supabase warnings anymore

### Step 3: Run Database Schema (If Not Done)

1. Go to Supabase Dashboard → SQL Editor
2. Copy ALL of `backend/src/db/schema.sql`
3. Paste and Run in SQL Editor

### Step 4: Test!

Try registering again at http://localhost:3000

---

## Quick Verification

After creating `.env` and restarting:

✅ Backend console should show: "🚀 Aurora Sentinel Backend running on port 3001"  
✅ Should NOT see: "WARNING: Supabase credentials not configured"  
✅ Registration should work!

---

**This is the ONLY thing blocking you right now - create the .env file!** 🎯
