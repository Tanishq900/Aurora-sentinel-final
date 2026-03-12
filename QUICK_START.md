# Quick Start Guide

Get Aurora Campus Sentinel running in 5 minutes!

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Resend account (for email) or use console fallback

## 1. Clone & Install

```bash
# Install all dependencies
npm run install:all

# Or install individually:
cd backend && npm install
cd ../frontend && npm install
cd ../mobile && npm install
```

## 2. Database Setup (Supabase)

1. Create a new Supabase project
2. Go to SQL Editor
3. Copy and run `backend/src/db/schema.sql`
4. Note your connection strings:
   - Project URL
   - Service Role Key
   - Anon Key

## 3. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT (generate strong secrets)
JWT_ACCESS_SECRET=your-random-secret-here
JWT_REFRESH_SECRET=your-random-secret-here

# Email (optional - will log to console if not set)
RESEND_API_KEY=your-resend-key
EMAIL_FROM=noreply@aurora-sentinel.com

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 4. Frontend Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001
```

## 5. Start Development Servers

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

## 6. Test the Application

1. Open `http://localhost:3000`
2. Register a new account
3. Check email for OTP (or check console if Resend not configured)
4. Verify OTP
5. Login
6. Test SOS button
7. Test risk monitoring

## 7. Test Security Dashboard

1. Register another account with role "security"
2. Verify and login
3. Should see Security Command Center
4. Test alerts from student account

## Common Issues

### Database Connection Failed
- Check Supabase URL and keys
- Ensure schema.sql was run
- Check network connection

### OTP Not Received
- Check Resend API key
- Check console logs (fallback mode)
- Check spam folder

### WebSocket Connection Failed
- Ensure backend is running
- Check CORS settings
- Check WS_URL in frontend .env

### Sensor Access Denied
- Grant microphone permissions
- Grant motion sensor permissions (iOS requires permission request)

## Next Steps

- Read `DEPLOYMENT.md` for production deployment
- Read `PROJECT_STRUCTURE.md` for architecture details
- Customize risk thresholds
- Add geofencing for location risk
- Configure Mapbox for maps
