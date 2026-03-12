# 👤 Create Test User Accounts

## Quick Setup

I've created a script to add test user accounts so you can login and test the application immediately.

## Test User Credentials

### Student Account
- **Email**: `student@test.com`
- **Password**: `student123`
- **Role**: Student
- **Verified**: Yes (can login immediately)

### Security Account
- **Email**: `security@test.com`
- **Password**: `security123`
- **Role**: Security
- **Verified**: Yes (can login immediately)

## How to Create Test Users

### Method 1: Run the Seed Script (Recommended)

1. **Make sure backend is stopped** (Ctrl+C if running)

2. **Run the seed script**:
   ```powershell
   cd backend
   npm run seed:users
   ```

3. **You'll see output** like:
   ```
   ✅ Created user: student@test.com
   ✅ Created user: security@test.com
   ✅ Test users seeding complete!
   ```

4. **Done!** You can now login with the credentials above.

### Method 2: Manual SQL (Alternative)

If the script doesn't work, you can create users directly via SQL:

1. **Go to Supabase Dashboard → SQL Editor**
2. **Run this SQL** (passwords are already hashed):
   ```sql
   -- Note: This requires bcrypt hashes, so use the script instead!
   -- The seed script handles password hashing automatically
   ```

**Recommendation**: Use Method 1 (the script) as it handles password hashing correctly.

## Login and Test

1. **Go to**: http://localhost:3000
2. **Click "Log In"**
3. **Use test credentials**:
   - Student: `student@test.com` / `student123`
   - Security: `security@test.com` / `security123`
4. **You'll be logged in** and can test the application!

## Notes

- ✅ Both accounts are **pre-verified** (no OTP needed)
- ✅ Passwords are **hashed** securely (bcrypt)
- ✅ Can login immediately
- ✅ Can test all features

---

**Run `npm run seed:users` in the backend folder to create test accounts!** 🚀
