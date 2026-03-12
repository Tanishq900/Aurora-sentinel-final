# 🚀 Setup Instructions - Supabase Integration

## ✅ Your Credentials (Ready to Use!)

I've prepared your Supabase credentials. Here's what you need to do:

### Step 1: Create backend/.env File

Since `.env` files are gitignored (for security), you need to create it manually:

1. **Open**: `backend/ENV_SETUP.txt`
2. **Copy all the content** (everything between the lines)
3. **Create a new file**: `backend/.env` (note: starts with a dot!)
4. **Paste the content** into `backend/.env`
5. **Save the file**

**Your Supabase credentials are already filled in!**

### Step 2: Run Database Schema

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New Query"**
5. **Open**: `backend/src/db/schema.sql`
6. **Copy ALL contents** (the entire file)
7. **Paste** into Supabase SQL Editor
8. Click **"Run"** button (or press `Ctrl+Enter`)

This creates these tables:
- ✅ `users`
- ✅ `otp_codes`
- ✅ `sos_events`
- ✅ `risk_snapshots`
- ✅ `security_actions`

### Step 3: Restart Backend Server

1. **Stop the backend** (if running):
   - Go to the terminal where backend is running
   - Press `Ctrl+C`

2. **Start it again**:
   ```powershell
   cd backend
   npm run dev
   ```

3. **Look for success messages**:
   - Should NOT see Supabase warnings anymore
   - Should see: "🚀 Aurora Sentinel Backend running on port 3001"

### Step 4: Test Registration!

1. Go to: **http://localhost:3000**
2. Click **"Register"**
3. Fill in:
   - Email: your email
   - Password: at least 8 characters
   - Role: Student
4. Click **"Register"**

**Expected behavior:**
- ✅ Registration succeeds!
- ✅ OTP code will appear in **backend terminal** (console log)
- ✅ Or check your email if Resend is configured

### Step 5: Verify OTP & Login

1. **Check backend terminal** for the OTP code
2. Go to verify page (or login page)
3. Enter the OTP code
4. Login with your credentials
5. ✅ Should work!

## 📝 Important Notes

### OTP Emails
- **Without Resend API key**: OTP codes are logged to backend console
- **With Resend API key**: OTP codes are sent via email
- To configure email: Add `RESEND_API_KEY` to `backend/.env`

### Your Credentials
- **Supabase URL**: `https://uszrynkltqxddwiytbnp.supabase.co`
- **Publishable Key**: Already in .env template
- **Service Key**: Already in .env template

## 🎯 Quick Checklist

- [ ] Created `backend/.env` file with credentials
- [ ] Ran database schema in Supabase SQL Editor
- [ ] Restarted backend server
- [ ] Tested registration
- [ ] Verified OTP code (check backend console)
- [ ] Tested login

---

**That's it! Your app should be fully functional now!** 🎉
