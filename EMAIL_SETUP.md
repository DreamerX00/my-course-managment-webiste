# Email Setup Guide

## Overview
The User Management system now supports sending actual email invitations to new users. This guide will help you configure the email service.

## Email Service Options

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Add to your `.env` file**:
   ```env
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-16-digit-app-password
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Create a SendGrid account** at https://sendgrid.com
2. **Generate an API key** in your SendGrid dashboard
3. **Add to your `.env` file**:
   ```env
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

### Option 3: Resend (Alternative)

1. **Create a Resend account** at https://resend.com
2. **Generate an API key** in your Resend dashboard
3. **Add to your `.env` file**:
   ```env
   RESEND_API_KEY=your-resend-api-key
   ```

## Environment Variables

Add these to your `.env` file:

```env
# Required for all email services
NEXTAUTH_URL=http://localhost:3000

# For Gmail/Nodemailer
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# Email Configuration (Outlook/Hotmail)
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=example@outlook.com
EMAIL_SERVER_PASSWORD=your-outlook-password

# For SendGrid (alternative)
# SENDGRID_API_KEY=your-sendgrid-api-key

# For Resend (alternative)
# RESEND_API_KEY=your-resend-api-key
```

## Testing Email Configuration

1. **Start your development server**
2. **Go to User Management** (`/dashboard/admin/user-management`)
3. **Click "Invite User"**
4. **Fill out the form and submit**
5. **Check the recipient's email** for the invitation

## Email Features

- ✅ **Professional HTML email template**
- ✅ **Role-specific information**
- ✅ **Course assignment details**
- ✅ **Personal message support**
- ✅ **Secure invitation tokens**
- ✅ **7-day expiration**
- ✅ **One-time use tokens**

## Troubleshooting

### Email Not Sending
1. Check your email service credentials
2. Verify your `.env` file has the correct variables
3. Check the server console for error messages
4. Ensure your email service allows SMTP connections

### Gmail Issues
1. Make sure 2FA is enabled
2. Use App Password, not your regular password
3. Check if "Less secure app access" is disabled

### SendGrid/Resend Issues
1. Verify your API key is correct
2. Check your account has sending permissions
3. Verify your sender email is verified

## Security Notes

- Invitation tokens expire after 7 days
- Tokens can only be used once
- All invitations are logged in the database
- Email addresses are validated before sending 