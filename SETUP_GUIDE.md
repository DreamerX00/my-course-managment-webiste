# Supabase & Resend Integration Setup Guide

This guide will help you configure Supabase (PostgreSQL database) and Resend (email service) for your course management application.

## 📦 Prerequisites

✅ Packages installed:
- `@supabase/supabase-js` - Supabase client library
- `resend` - Resend email SDK

## 🗄️ Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the details:
   - **Name**: course-management (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is perfect for development

### Step 2: Get Your Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select the **URI** tab
4. Copy the connection string (it looks like this):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created

### Step 3: Get Your Supabase API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon/public key**: Your anonymous key (safe to expose in client)
   - **service_role key**: Your service role key (keep SECRET, server-side only!)

### Step 4: Update Your .env File

Update the `.env` file in your project root with your Supabase credentials:

```env
# Supabase Database Configuration
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### Step 5: Initialize Your Database Schema

Run these commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to Supabase
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate deploy
```

### Step 6: Verify Database Connection

Test your database connection:

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

## 📧 Resend Email Setup

### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **"Create API Key"**
3. Give it a name (e.g., "Development" or "Course Management")
4. Select permissions: **"Full Access"** or **"Sending access"**
5. Click **"Create"**
6. Copy the API key (it starts with `re_`)

⚠️ **Important**: Save this key immediately! You won't be able to see it again.

### Step 3: Configure Sending Domain (Optional but Recommended)

For production use, you should verify your own domain:

1. Go to **Domains** in Resend dashboard
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow the DNS configuration instructions
5. Wait for verification (usually takes a few minutes)

For development, you can use the default `onboarding@resend.dev` address.

### Step 4: Update Your .env File

Add your Resend API key to the `.env` file:

```env
# Resend Email Configuration
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="onboarding@resend.dev"  # Or your verified domain email
```

If you verified a custom domain, update `EMAIL_FROM`:

```env
EMAIL_FROM="noreply@yourdomain.com"
```

## 🔐 NextAuth Configuration

Don't forget to set up NextAuth secrets:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"  # Your app URL
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
```

Generate a secure secret:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## ✅ Complete .env File Example

Here's what your complete `.env` file should look like:

```env
# Environment variables declared in this file are automatically made available to Prisma.

# Supabase Database Configuration
DATABASE_URL="postgresql://postgres.xxxxx:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Resend Email Configuration
RESEND_API_KEY="re_xxxxxx"
EMAIL_FROM="onboarding@resend.dev"
```

## 🚀 Testing Your Setup

### 1. Test Database Connection

```bash
# Start your development server
npm run dev

# In another terminal, test Prisma
npx prisma studio
```

### 2. Test Email Sending

You can test email sending by creating a test user invitation through your admin panel, or by using the API route directly.

### 3. Check for Errors

Look at your terminal for any errors when starting the dev server. Common issues:

- **DATABASE_URL not found**: Double-check your .env file
- **Invalid API key**: Verify your Resend API key
- **Connection refused**: Check if your Supabase credentials are correct

## 📝 Important Notes

1. **Never commit your .env file** - It's already in `.gitignore`, but double-check!
2. **Use different credentials for production** - Never use development credentials in production
3. **Supabase Free Tier Limits**:
   - 500MB database space
   - 2GB bandwidth
   - 50,000 monthly active users
4. **Resend Free Tier Limits**:
   - 3,000 emails/month
   - 100 emails/day

## 🔧 Troubleshooting

### Database Connection Issues

If you get "Connection refused" errors:

```bash
# Check if your DATABASE_URL is correct
npx prisma db pull
```

### Email Sending Issues

If emails aren't being sent:

1. Check your RESEND_API_KEY in the .env file
2. Verify the API key has correct permissions in Resend dashboard
3. For custom domains, ensure DNS records are properly configured
4. Check the email address format is correct

### Environment Variables Not Loading

1. Restart your development server after changing .env
2. Make sure .env is in the root directory
3. Variable names must match exactly (case-sensitive)

## 🎉 Next Steps

Once everything is configured:

1. Run `npm run dev` to start your development server
2. Test user registration and authentication
3. Test email invitations from the admin panel
4. Verify database operations work correctly

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

Need help? Check the logs in your terminal for detailed error messages!
