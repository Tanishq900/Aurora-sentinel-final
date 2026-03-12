# 🔍 Check the Response Body for Error Message

## What You've Shown

I can see the request headers and status (400 Bad Request), but I need the **response body** to see the actual error.

## How to See the Error Message

In Developer Tools (F12) → Network tab:

1. **Click** on the `/api/auth/register` request (the one showing 400)
2. **Look for tabs** at the top of the details panel:
   - **Headers** (what you showed)
   - **Preview** ← Check this!
   - **Response** ← Or this!
3. **Click on "Preview" or "Response" tab**
4. **You'll see the error message** like:
   ```json
   {
     "error": "Failed to create user: relation 'users' does not exist"
   }
   ```
   OR
   ```json
   {
     "error": "Failed to create user: [some other error]"
   }
   ```

## Common Errors You Might See

### "relation 'users' does not exist"
**Cause**: Database schema not run  
**Fix**: Run `backend/src/db/schema.sql` in Supabase SQL Editor

### "Missing Supabase configuration"
**Cause**: Backend not restarted after creating .env  
**Fix**: Restart backend server (Ctrl+C, then `npm run dev`)

### "Failed to create user: invalid input syntax"
**Cause**: Database connection issue or credentials wrong  
**Fix**: Check .env file has correct Supabase credentials

### "Validation errors"
**Cause**: Form validation failed  
**Fix**: Check email format, password length (min 8 chars)

## What I Need From You

**Please scroll down in the Network tab details and show me:**
- The **Preview** tab content, OR
- The **Response** tab content

This will show the exact error message so I can help you fix it!

---

**The response body will tell us exactly what's wrong!** 🔍
