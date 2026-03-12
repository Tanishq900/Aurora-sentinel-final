# SOS Timeline & Location Handling Upgrade

This document summarizes the targeted upgrades applied to the Aurora Sentinel project.

## ✅ PART A - SOS Timeline Full History

### 1. Backend - Event History Table

**Created:** `backend/src/db/migrations/add_sos_event_history.sql`

- New table `sos_event_history` to store all events for each SOS
- Columns: `id`, `sos_id`, `type`, `risk_value`, `meta` (JSONB), `timestamp`
- Indexes for efficient querying
- Foreign key to `sos_events` table

### 2. Backend - Event Logging Functions

**Updated:** `backend/src/services/sos.ts`

- Added `logSOSEvent()` function to log events to history
- Added `getSOSEventHistory()` function to fetch all events for a SOS
- Events are logged non-blocking (errors don't break main flow)

**Event Types Logged:**
- ✅ `sos_triggered` - When SOS is created (in `createSOSEvent()`)
- ✅ `zone_entered` - When location is checked (in `createSOS` controller)
- ✅ `acknowledged` - When security acknowledges (in `updateSOSStatus()`)
- ✅ `resolved` - When security resolves (in `updateSOSStatus()`)

### 3. Backend - GET /api/sos/:id/events Endpoint

**Updated:** `backend/src/controllers/sos.controller.ts`
**Updated:** `backend/src/routes/sos.routes.ts`

- New endpoint: `GET /api/sos/:id/events`
- Returns ALL events for a SOS, ordered by timestamp ASC
- Includes access control (students can only see their own SOS events)
- Route placed before `/:id` to avoid conflicts

### 4. Frontend - Timeline Component Update

**Updated:** `frontend/src/components/EventTimeline.tsx`

- Now fetches events from `GET /api/sos/:id/events` when `sosId` prop is provided
- Displays all events in chronological order
- Handles all event types: `sos_triggered`, `ai_risk`, `zone_entered`, `acknowledged`, `resolved`
- Shows loading state while fetching
- Falls back to building from `sosEvent` prop if API not available

**Updated:** `frontend/src/services/sos.service.ts`
- Added `getSOSEvents(sosId)` method to fetch event history

**Updated Usage:**
- `frontend/src/pages/student/StudentDashboard.tsx` - Passes `sosId` to timeline
- `frontend/src/pages/security/SecurityAlertDetail.tsx` - Passes `sosId` to timeline

## ✅ PART B - Location Handling Rule (Option C)

### 1. Backend - Location Risk Calculation

**Updated:** `backend/src/risk/engine.ts`

- `calculateLocationRisk()` now returns `isNormalZone` flag
- If user is NOT inside any polygon:
  - No multiplier applied (factor stays at 1.0)
  - `isNormalZone` is set to `true`
- If user is inside a polygon:
  - Multiplier applied as before
  - `matchedZone` contains zone info

### 2. Backend - Zone Event Logging

**Updated:** `backend/src/controllers/sos.controller.ts`

- When creating SOS, checks location against risk zones
- Logs `zone_entered` event with:
  - High-risk zone: `meta.zoneName`, `meta.zoneType`, `meta.multiplier`
  - Low-risk zone: `meta.zoneName`, `meta.zoneType`, `meta.multiplier`
  - Normal zone: `meta.normal_zone = true`

### 3. Frontend - Explanation Engine

**Updated:** `frontend/src/risk/explain.ts`
**Updated:** `backend/src/risk/explain.ts`

- Now handles normal zones in explanation
- Shows: "User is outside all predefined risk zones (normal area)" when `isNormalZone` is true
- Integrates with existing explanation bullets

### 4. Frontend - Timeline Display

**Updated:** `frontend/src/components/EventTimeline.tsx`

- `zone_entered` events display:
  - High/low-risk zones: "Entered [type] zone: [name]"
  - Normal zones: "User is outside all predefined risk zones (normal area)"

## 📋 Database Migration Required

Run the migration to create the event history table:

```sql
-- Execute: backend/src/db/migrations/add_sos_event_history.sql
```

Or manually:
```sql
CREATE TABLE IF NOT EXISTS sos_event_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sos_id UUID NOT NULL REFERENCES sos_events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sos_triggered', 'ai_risk', 'zone_entered', 'acknowledged', 'resolved')),
  risk_value FLOAT,
  meta JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sos_event_history_sos_id ON sos_event_history(sos_id);
CREATE INDEX idx_sos_event_history_timestamp ON sos_event_history(timestamp ASC);
CREATE INDEX idx_sos_event_history_type ON sos_event_history(type);
```

## 🔒 Safety & Compatibility

- ✅ All existing functionality preserved
- ✅ Event logging is non-blocking (errors don't break SOS creation)
- ✅ Backward compatible with existing SOS events
- ✅ Timeline component has fallback behavior
- ✅ No changes to risk engine scoring logic (except location rule)
- ✅ No changes to authentication, sockets, analytics, or UI styles

## 🎯 Event Flow

1. **SOS Created:**
   - Logs `sos_triggered` event
   - Checks location → logs `zone_entered` event (high/low/normal)

2. **Status Updated:**
   - Logs `acknowledged` or `resolved` event

3. **Timeline Display:**
   - Fetches all events from `/api/sos/:id/events`
   - Displays in chronological order

## 📝 Notes

- `ai_risk` events can be added later if live risk recalculation is implemented
- Event logging uses try-catch to ensure it never breaks main SOS flow
- All events include `risk_value` and `meta` for detailed information
- Timeline automatically fetches and displays full history when `sosId` is provided
