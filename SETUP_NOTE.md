# ⚠️ Setup Required Before Running

The application is starting, but you need to configure the database connection.

## Quick Fix for Testing

The backend server needs Supabase credentials. You have two options:

### Option 1: Use Supabase (Recommended)

1. Create a free Supabase account: https://supabase.com
2. Create a new project
3. Go to SQL Editor and run `backend/src/db/schema.sql`
4. Get your credentials:
   - Project URL (Settings > API > Project URL)
   - Anon Key (Settings > API > anon public key)
   - Service Role Key (Settings > API > service_role secret key)
5. Update `backend/.env` with your credentials

### Option 2: Quick Test Mode (Database Errors Expected)

The app will start but authentication won't work without a database.
This is fine for testing the UI structure.

## Current Status

- ✅ Dependencies installed
- ✅ Backend server starting (may show database errors)
- ✅ Frontend server starting
- ⚠️ Database connection needed for full functionality

## Once Database is Configured

1. Stop the servers (Ctrl+C)
2. Update `backend/.env` with Supabase credentials
3. Restart: `cd backend && npm run dev` (Terminal 1)
4. Frontend should be at: http://localhost:3000

## For Now

The servers are running in the background. You can:
- Access frontend: http://localhost:3000 (will show errors until DB is configured)
- Check backend: http://localhost:3001/health (should respond)
