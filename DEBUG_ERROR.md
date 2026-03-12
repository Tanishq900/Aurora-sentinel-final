# 🔍 Debug 400 Error

## Current Status

You're getting a **400 Bad Request** which means:
- ✅ Connection is working
- ✅ API proxy is working
- ⚠️ Backend is rejecting the request

## How to See the Actual Error

### Method 1: Browser Developer Tools

1. **Open Developer Tools**: Press `F12`
2. **Go to Network tab**
3. **Try registering again** (submit the form)
4. **Find the request**: Look for `/api/auth/register` (it will be red if error)
5. **Click on it**
6. **Go to "Response" tab** (or "Preview" tab)
7. **You'll see the error message** like:
   ```json
   {
     "error": "Failed to create user: ..."
   }
   ```

### Method 2: Backend Console

Check the terminal where the backend server is running - it should show error messages there too.

## Common Errors & Solutions

### Error: "Failed to create user: relation 'users' does not exist"
**Solution**: Database schema not run
- Go to Supabase Dashboard → SQL Editor
- Run `backend/src/db/schema.sql`

### Error: "Missing Supabase configuration"
**Solution**: `.env` file not created
- Create `backend/.env` file (see `backend/ENV_SETUP.txt`)
- Restart backend server

### Error: "Failed to create user: ..."
**Solution**: Usually means database connection issue
- Check `.env` file has correct credentials
- Restart backend server
- Verify Supabase project is active

### Error: Validation errors
**Solution**: Check the response - it might show what field failed validation
- Email format
- Password length (minimum 8 characters)

## Quick Checklist

- [ ] Created `backend/.env` file?
- [ ] Ran database schema in Supabase?
- [ ] Restarted backend server after creating `.env`?
- [ ] Checked the Network tab response for exact error?

## Next Steps

1. **Check the error message** (see Method 1 above)
2. **Share the error message** or fix based on the error
3. **Verify setup steps** in `SETUP_INSTRUCTIONS.md`

---

**The error message will tell us exactly what's wrong!** 🔍
