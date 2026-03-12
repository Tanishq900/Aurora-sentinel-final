# Deployment Guide

## Production Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your Git repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `RESEND_API_KEY`
   - `CORS_ORIGIN` (your frontend URL)

### Frontend (Vercel)

1. Create a new project on Vercel
2. Connect your Git repository
3. Set root directory: `frontend`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variables:
   - `VITE_API_URL` (your backend URL)
   - `VITE_WS_URL` (your backend WebSocket URL)
   - `VITE_MAPBOX_TOKEN` (optional)

### Database (Supabase)

1. Create a new Supabase project
2. Run the SQL schema from `backend/src/db/schema.sql`
3. Set up Row Level Security policies
4. Get connection strings and API keys

### Mobile App (Expo EAS)

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build for iOS: `eas build --platform ios`
5. Build for Android: `eas build --platform android`
6. Submit to stores: `eas submit`

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...
SUPABASE_SERVICE_KEY=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=noreply@aurora-sentinel.com
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-domain.com
VITE_WS_URL=https://your-backend-domain.com
VITE_MAPBOX_TOKEN=...
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
EXPO_PUBLIC_WS_URL=https://your-backend-domain.com
```

## Database Setup

1. Create Supabase project
2. Run SQL schema: `backend/src/db/schema.sql`
3. Configure Row Level Security (optional)
4. Test connection

## Security Checklist

- [ ] Change all default secrets
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Enable rate limiting (optional)
- [ ] Set up monitoring/logging
- [ ] Configure email service
- [ ] Test all endpoints
- [ ] Review error handling

## Monitoring

- Set up error tracking (Sentry, etc.)
- Monitor API performance
- Track WebSocket connections
- Monitor database performance
- Set up alerts for critical errors
