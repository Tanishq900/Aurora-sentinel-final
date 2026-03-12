# Aurora Campus Sentinel - Project Structure

## 📁 Complete Project Structure

```
aurora-sentinel/
├── backend/                    # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── sos.controller.ts
│   │   │   └── presentation.controller.ts
│   │   ├── routes/             # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── sos.routes.ts
│   │   │   └── presentation.routes.ts
│   │   ├── services/           # Business logic
│   │   │   ├── auth.ts
│   │   │   ├── email.ts
│   │   │   └── sos.ts
│   │   ├── middlewares/        # Express middlewares
│   │   │   └── auth.ts
│   │   ├── db/                 # Database
│   │   │   ├── client.ts       # Supabase client
│   │   │   └── schema.sql      # Database schema
│   │   ├── sockets/            # WebSocket handlers
│   │   │   └── handlers.ts
│   │   ├── risk/               # Risk Engine
│   │   │   └── engine.ts
│   │   ├── presentation/       # Presentation Mode
│   │   │   └── config.ts
│   │   ├── utils/              # Utilities
│   │   │   └── jwt.ts
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   └── SOSButton.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── VerifyPage.tsx
│   │   │   ├── student/
│   │   │   │   └── StudentDashboard.tsx
│   │   │   └── security/
│   │   │       ├── SecurityDashboard.tsx
│   │   │       ├── SecurityAlertDetail.tsx
│   │   │       └── SecurityHistory.tsx
│   │   ├── services/           # API services
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   └── sos.service.ts
│   │   ├── state/              # Zustand stores
│   │   │   ├── auth.store.ts
│   │   │   └── presentation.store.ts
│   │   ├── sensors/            # Sensor access
│   │   │   ├── audio.ts
│   │   │   └── motion.ts
│   │   ├── risk/               # Risk Engine (frontend)
│   │   │   └── engine.ts
│   │   ├── ws/                 # WebSocket client
│   │   │   └── client.ts
│   │   ├── utils/              # Utilities
│   │   │   └── ProtectedRoute.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
├── mobile/                     # React Native Mobile App
│   ├── src/
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── student/
│   │   │   │   └── StudentDashboardScreen.tsx
│   │   │   └── security/
│   │   │       └── SecurityDashboardScreen.tsx
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── sos.service.ts
│   │   └── config/
│   │       └── api.ts
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── README.md                   # Main README
├── DEPLOYMENT.md               # Deployment guide
├── .gitignore
└── package.json                # Root package.json (workspaces)
```

## 🔑 Key Features Implemented

### ✅ Backend
- [x] Express + TypeScript server
- [x] Supabase PostgreSQL database client
- [x] JWT authentication (access + refresh tokens)
- [x] OTP email verification (Resend)
- [x] Role-based access control (student/security)
- [x] Risk Engine with exact formulas
- [x] SOS event system
- [x] WebSocket server (Socket.io)
- [x] Real-time alerts & live feeds
- [x] Presentation Mode feature flag
- [x] RESTful API endpoints

### ✅ Frontend (Web)
- [x] React + TypeScript + Vite
- [x] Tailwind CSS (dark mode)
- [x] Zustand state management
- [x] Protected routes
- [x] Authentication pages (Login/Register/Verify)
- [x] Student Dashboard
  - [x] SOS button with countdown
  - [x] Live risk monitoring
  - [x] Risk factor visualization
  - [x] History (last 7 days)
  - [x] Presentation Mode toggle
- [x] Security Command Center
  - [x] Live alerts dashboard
  - [x] Alert detail view
  - [x] Risk timeline chart
  - [x] Status management
  - [x] History/filtering
- [x] Real-time WebSocket integration
- [x] Audio & Motion sensors
- [x] Risk visualization (charts)

### ✅ Mobile App
- [x] React Native + Expo
- [x] Student app (SOS button, risk display)
- [x] Security app (alerts, status updates)
- [x] Secure token storage
- [x] Navigation setup

## 🗄 Database Schema

Tables:
- `users` - User accounts
- `otp_codes` - Email verification codes
- `sos_events` - SOS alerts
- `risk_snapshots` - Real-time risk data
- `security_actions` - Security team actions

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/verify` - Verify OTP
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### SOS
- `POST /api/sos` - Create SOS event
- `GET /api/sos` - Get SOS events
- `GET /api/sos/:id` - Get SOS by ID
- `PATCH /api/sos/:id/status` - Update status

### Presentation Mode
- `GET /api/presentation` - Get status
- `POST /api/presentation/toggle` - Toggle mode

## 🔌 WebSocket Events

### Client → Server
- `join_sos` - Join SOS room
- `leave_sos` - Leave SOS room
- `live_feed` - Send live feed data

### Server → Client
- `new_sos_alert` - New SOS alert
- `sos_status_update` - Status update
- `live_feed` - Live feed data

## 🧮 Risk Engine Formulas

### Audio Stress (0-35)
```
audioStress = (rms * 0.5) + (pitchVariance * 0.3) + (Math.min(spikeCount / 5, 1) * 0.2)
audioScore = audioStress * 35
```

### Motion Intensity (0-25)
```
motionIntensity = min((accelerationMagnitude / 30) * 0.6 + (jitter / 20) * 0.4, 1)
motionScore = motionIntensity * 25
```

### Time Risk (0-20)
- 06:00-20:00 → 0.2
- 20:00-00:00 → 0.6
- 00:00-04:00 → 1.0
- 04:00-06:00 → 0.4
```
timeScore = timeRiskFactor * 20
```

### Location Risk (0-20)
```
locationRiskFactor = 1.0 (demo mode)
locationScore = locationRiskFactor * 20
```

### Total Risk
```
totalRisk = audioScore + motionScore + timeScore + locationScore
```

## 🚀 Next Steps

1. **Environment Setup**
   - Copy `.env.example` files
   - Configure Supabase
   - Set up Resend API key
   - Configure JWT secrets

2. **Database Setup**
   - Create Supabase project
   - Run `backend/src/db/schema.sql`
   - Test connection

3. **Run Development**
   - Backend: `cd backend && npm install && npm run dev`
   - Frontend: `cd frontend && npm install && npm run dev`
   - Mobile: `cd mobile && npm install && npm start`

4. **Deploy**
   - Backend → Render
   - Frontend → Vercel
   - Database → Supabase
   - Mobile → Expo EAS

## 📝 Notes

- All formulas match the specification exactly
- Real OTP email system implemented
- WebSocket real-time updates working
- Presentation Mode toggleable with password
- Production-ready structure
- Type-safe throughout (TypeScript)
- Secure authentication (JWT + bcrypt)
