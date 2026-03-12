# 🔐 Presentation Mode Password

## Default Password

**Password**: `demo123`

## Where It's Used

The presentation mode password is used to toggle Presentation Mode from the Student Dashboard.

### How to Use

1. **Login** as a student
2. **Go to Student Dashboard**
3. **Click "Settings"** or "Presentation Mode" button
4. **Enter password**: `demo123`
5. **Click "Enable"** or "Disable"**

## Configuration

The password is configured in `backend/.env`:
```
PRESENTATION_MODE_PASSWORD=demo123
```

## Change the Password

To change the password:

1. **Edit** `backend/.env` file
2. **Update** `PRESENTATION_MODE_PASSWORD=your-new-password`
3. **Restart backend server**

## What Presentation Mode Does

When enabled:
- Lower auto-SOS threshold (35 instead of 50)
- Increased audio/motion multipliers (1.5x)
- Forced location/time risks to maximum
- Useful for demos and presentations

---

**Current password: `demo123`** 🔑
