# 🔧 Create backend/.env File - Step by Step

## Quick Method (Windows)

### Option 1: Using Notepad

1. **Open Notepad** (or any text editor)
2. **Copy ALL content** from `backend/ENV_SETUP.txt` (the file you have open)
3. **Click File → Save As**
4. **Navigate to**: `C:\Users\jeetp\aurora-sentinel\backend\`
5. **File name**: Type `.env` (important: starts with a dot!)
6. **Save as type**: Select "All Files (*.*)" (so it doesn't add .txt)
7. **Click Save**

### Option 2: Using VS Code / Your Editor

1. **Open** `backend/ENV_SETUP.txt`
2. **Select All** (Ctrl+A)
3. **Copy** (Ctrl+C)
4. **Create New File**: Ctrl+N
5. **Paste** (Ctrl+V)
6. **Save As**: `backend/.env`
   - Make sure the filename starts with a dot: `.env`
   - Not `env.txt` or `.env.txt` - just `.env`

### Option 3: Using PowerShell (Advanced)

```powershell
cd backend
Copy-Item ENV_SETUP.txt .env
```

Then edit `.env` to make sure the content is correct.

## Verify It's Created

After creating the file:
1. Go to `backend` folder in File Explorer
2. You should see `.env` file (might be hidden - enable "Show hidden files")
3. Open it - should contain your Supabase credentials

## Important Notes

- ✅ File must be named exactly: `.env` (starts with dot, no extension)
- ✅ File must be in: `backend/.env` (not `backend/env.txt`)
- ✅ File contains your Supabase credentials (already filled in ENV_SETUP.txt)

## After Creating .env

1. **Restart backend server**:
   - Stop it (Ctrl+C)
   - Start it again: `cd backend && npm run dev`

2. **Run database schema** in Supabase (if not done yet):
   - Copy `backend/src/db/schema.sql`
   - Run in Supabase SQL Editor

3. **Test registration** again!

---

**The .env file is the key!** Once you create it and restart the backend, it should work! 🚀
