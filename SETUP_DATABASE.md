# 🗄️ Database Setup Instructions

## Your Supabase Credentials

I've configured your backend `.env` file with:
- ✅ Supabase URL: `https://uszrynkltqxddwiytbnp.supabase.co`
- ✅ Anon/Publishable Key: Configured
- ✅ Service Role Key: Configured

## Next Step: Run Database Schema

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `uszrynkltqxddwiytbnp`
3. **Go to SQL Editor** (left sidebar)
4. **Click "New Query"**
5. **Copy the entire contents** of `backend/src/db/schema.sql`
6. **Paste into the SQL Editor**
7. **Click "Run"** (or press Ctrl+Enter)

## Verify Tables Created

After running the schema, check that these tables exist:
- `users`
- `otp_codes`
- `sos_events`
- `risk_snapshots`
- `security_actions`

Go to: **Table Editor** → You should see all 5 tables

## Restart Backend Server

After setting up the database:

1. **Stop the backend server** (Ctrl+C in the terminal)
2. **Restart it**: `cd backend && npm run dev`

## Test Registration

Once the backend restarts:
1. Go to http://localhost:3000
2. Try registering an account
3. Should work now! ✅

---

**Quick SQL Schema Location**: `backend/src/db/schema.sql`
