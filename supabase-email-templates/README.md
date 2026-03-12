# Aurora Sentinel - Supabase Email Templates

This folder contains custom HTML email templates for Supabase authentication emails.

## 📧 Templates Included

1. **confirm-signup.html** - Email verification for new signups
2. **magic-link.html** - Magic link login emails
3. **reset-password.html** - Password reset emails
4. **change-email.html** - Email change confirmation

## 🎨 Design Features

- **Brand Colors**: Aurora Indigo (#4F46E5) primary, #6366F1 accent
- **Modern Card UI**: Centered, rounded corners, subtle shadow
- **Mobile Responsive**: Works on all devices
- **Professional**: Security-oriented, trustworthy messaging
- **Branded**: Aurora Sentinel logo and consistent styling

## 📋 How to Use

1. Log in to your Supabase Dashboard
2. Navigate to **Authentication → Email Templates**
3. For each template type:
   - Click on the template (e.g., "Confirm Signup")
   - Select "Custom" instead of "Default"
   - Copy and paste the corresponding HTML from this folder
   - Click "Save"

## ✅ Template Mapping

| Supabase Template | File Name |
|------------------|-----------|
| Confirm Signup | `confirm-signup.html` |
| Magic Link | `magic-link.html` |
| Reset Password | `reset-password.html` |
| Change Email | `change-email.html` |

## 🔗 Important Variables

All templates use `{{ .ConfirmationURL }}` which Supabase automatically replaces with the actual confirmation link. Do not modify this variable.

## 📱 Mobile Responsive

All templates are designed to work seamlessly on:
- Desktop browsers
- Mobile devices
- Email clients (Gmail, Outlook, Apple Mail, etc.)
