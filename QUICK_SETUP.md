# ⚡ Quick Setup Guide - Your Supabase Credentials

## ✅ Credentials Configured

I've created `backend/.env` with your Supabase credentials:
- **URL**: `https://uszrynkltqxddwiytbnp.supabase.co`
- **Publishable Key**: Configured
- **Service Role Key**: Configured

## 📋 Next Steps

### 1. Run Database Schema in Supabase

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New Query"**
5. **Copy ALL contents** from: `backend/src/db/schema.sql`
6. **Paste** into the SQL Editor
7. Click **"Run"** (or press `Ctrl+Enter`)

This creates all required tables:
- `users`
- `otp_codes`
- `sos_events`
- `risk_snapshots`
- `security_actions`

### 2. Restart Backend Server

After running the schema:

1. **Stop the backend** (press `Ctrl+C` in the terminal where it's running)
2. **Restart it**:
   ```powershell
   cd backend
   npm run dev
   ```

### 3. Test Registration

1. Go to: **http://localhost:3000**
2. Click **"Register"**
3. Fill in the form:
   - Email: your email
   - Password: at least 8 characters
   - Role: Student
4. Click **"Register"**
5. ✅ Should work now!

## 🔍 Verify Database Setup

To check if tables were created:
1. In Supabase Dashboard → **Table Editor**
2. You should see 5 tables listed

## 📝 Note About OTP Emails

If you haven't configured Resend API key:
- OTP codes will be logged to the **backend console** (terminal)
- Check the backend terminal output to see the OTP code
- For production, configure `RESEND_API_KEY` in `.env`

---

**Ready to go!** Run the schema, restart backend, and test! 🚀
