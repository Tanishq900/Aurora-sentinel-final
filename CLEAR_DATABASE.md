# 🗑️ Clear All Users and Data

## ⚠️ WARNING

This will **DELETE ALL DATA** from your database:
- ✅ All users
- ✅ All OTP codes
- ✅ All SOS events
- ✅ All risk snapshots
- ✅ All security actions

**This cannot be undone!**

## How to Clear Database

### Step 1: Go to Supabase SQL Editor

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**
3. **Click "SQL Editor"** (left sidebar)
4. **Click "New Query"**

### Step 2: Run the Clear Script

1. **Open**: `backend/src/db/clear_all_users.sql`
2. **Copy ALL contents**
3. **Paste** into Supabase SQL Editor
4. **Click "Run"** (or press `Ctrl+Enter`)

### Step 3: Verify

After running, you should see:
```
users_count: 0
otp_codes_count: 0
sos_events_count: 0
risk_snapshots_count: 0
security_actions_count: 0
```

## What Gets Deleted

✅ **users** table - All registered accounts  
✅ **otp_codes** table - All verification codes  
✅ **sos_events** table - All emergency events  
✅ **risk_snapshots** table - All risk data  
✅ **security_actions** table - All security actions  

## After Clearing

- ✅ All user accounts deleted
- ✅ All login credentials removed
- ✅ All data cleared
- ✅ You can start fresh with new registrations

---

**File to run**: `backend/src/db/clear_all_users.sql`
