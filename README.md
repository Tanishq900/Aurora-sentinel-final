# Aurora (Campus Sentinel) - v1 Production System

A comprehensive campus security monitoring system with real-time risk assessment, SOS alerts, and WebSocket-based live feeds.

## 🏗 Architecture

- **Frontend**: React + TypeScript (Desktop-first Web App)
- **Backend**: Node.js + Express + Socket.io
- **Mobile**: React Native (Expo)
- **Database**: Supabase (PostgreSQL)
- **Real-time**: WebSockets for alerts and live feeds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- Email service (Resend or SendGrid API key)

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../frontend && npm install
cd ../mobile && npm install
```

### Environment Setup

1. **Backend** - Copy `backend/.env.example` to `backend/.env` and fill in:
   - Database connection string
   - JWT secrets
   - Email service API key
   - Port configuration

2. **Frontend** - Copy `frontend/.env.example` to `frontend/.env` and fill in:
   - API URL
   - WebSocket URL
   - Mapbox token (optional)

3. **Mobile** - Copy `mobile/.env.example` to `mobile/.env`

### Development

```bash
# Run backend (Terminal 1)
npm run dev:backend

# Run frontend (Terminal 2)
npm run dev:frontend

# Run mobile (Terminal 3)
npm run dev:mobile
```

## 📋 Features

- ✅ Real OTP Email Authentication
- ✅ Role-based Access (Student/Security)
- ✅ Real-time Risk Engine (Audio, Motion, Time, Location)
- ✅ Manual & AI-triggered SOS Alerts
- ✅ WebSocket Real-time Alerts & Live Feeds
- ✅ Security Command Center Dashboard
- ✅ Student Dashboard with Risk Monitoring
- ✅ Presentation Mode (Feature Flag)
- ✅ Mobile Apps (iOS/Android)

## 🔐 Authentication Flow

1. User registers with email + password
2. OTP code sent to email
3. User verifies OTP
4. Login with email + password
5. JWT tokens issued (access + refresh)

## 📊 Risk Engine

- **Audio Stress** (0-35): RMS, pitch variance, spike detection
- **Motion Intensity** (0-25): Acceleration magnitude, jitter
- **Time-of-Day Risk** (0-20): Night-time multiplier
- **Location Risk** (0-20): Geofencing (demo mode = 1.0)

Total Risk = Audio + Motion + Time + Location (0-100)

## 🚨 SOS System

- **Manual**: User-triggered with 10s countdown
- **AI-triggered**: Automatic when risk > threshold (50 normal / 35 presentation mode)
- Real-time alerts to Security dashboard
- Live audio/motion feed during active SOS

## 🎛 Presentation Mode

Global feature flag for demos:
- Lower auto-SOS threshold (35)
- Increased audio/motion multipliers
- Forced location/time risks

## 📱 Mobile Apps

- Student App: SOS button, risk display, login
- Security App: Real-time alerts, status updates

## 🗄 Database Schema

See `backend/src/db/schema.sql` for complete schema.

Tables:
- `users` - User accounts and roles
- `otp_codes` - Email verification codes
- `sos_events` - SOS alerts and incidents
- `risk_snapshots` - Real-time risk data
- `security_actions` - Security team actions

## 🚢 Deployment

### Backend
- **Render**: Node.js service
- Environment variables required

### Frontend
- **Vercel**: React app
- Set environment variables

### Database
- **Supabase**: PostgreSQL with Row Level Security

### Mobile
- **Expo EAS**: Build for iOS/Android

## 📝 License

MIT
