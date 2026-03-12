# 📧 Email Troubleshooting - No Email Received

## Quick Checks

### 1. Did You Restart Backend?
**CRITICAL**: The backend must be restarted after adding the API key!

- [ ] Stopped backend (Ctrl+C)?
- [ ] Started backend again (`cd backend && npm run dev`)?
- [ ] Backend console shows no email errors?

### 2. Is Registration Actually Working?

Check if registration is succeeding:
- If you're still getting **500 error** → Database schema not run yet
- If registration **succeeds** but no email → Email configuration issue

### 3. Check Backend Console

Look at the backend terminal output when you register:
- **Success**: Should see no errors, email sent
- **Error**: Check for email sending errors
- **Fallback**: If API key not loaded, you'll see: `[EMAIL] OTP for...` in console

### 4. Check Resend Dashboard

1. **Go to**: https://resend.com/dashboard
2. **Check "Logs"** or "Emails" section
3. **See if emails are being sent**:
   - ✅ Sent: Email sent but not delivered (check spam)
   - ❌ Failed: Error shown (usually domain/authentication issue)
   - ⚠️ No logs: API key not being used (backend not restarted?)

### 5. Common Issues

#### Issue A: Domain Not Verified (Most Common)

**Problem**: Resend requires you to verify a domain to send emails

**Solution**: 
- Go to Resend Dashboard → Domains
- Add and verify your domain
- OR use Resend's test domain for development

**Quick Fix**: 
- Use `onboarding@resend.dev` as FROM address (Resend's test domain)
- Update `EMAIL_FROM` in `.env`

#### Issue B: API Key Wrong

**Problem**: Invalid API key

**Solution**: 
- Verify API key in Resend Dashboard → API Keys
- Make sure it's the correct key
- Ensure it starts with `re_`

#### Issue C: Backend Not Restarted

**Problem**: Old backend still running without API key

**Solution**: 
- Stop backend (Ctrl+C)
- Start again: `cd backend && npm run dev`
- Check console for email logs

#### Issue D: Email in Spam

**Problem**: Email sent but in spam folder

**Solution**: 
- Check spam/junk folder
- Check Resend dashboard to confirm email was sent

### 6. Quick Test: Use Console Fallback

If emails aren't working, the backend will log OTP to console:

1. **Check backend terminal** when registering
2. **Look for**: `[EMAIL] OTP for [email]: [code]`
3. **Use that code** to verify (temporary solution)

## Next Steps

1. **Check backend console** for errors
2. **Check Resend dashboard** to see if emails are being sent
3. **Verify domain** in Resend (or use test domain)
4. **Check spam folder**

---

**Most likely issue: Domain not verified in Resend, or backend not restarted!**
