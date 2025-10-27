# 🚀 QUICK DEPLOYMENT GUIDE

**Last Updated:** ${new Date().toLocaleDateString()}  
**Platform:** Course Management System (Next.js 15 + Prisma + Supabase)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Code Quality ✅

- [x] All TypeScript errors resolved
- [x] Console.log statements removed
- [x] Error handling implemented
- [x] Security measures validated

### 2. Database ✅

- [x] Schema validated
- [x] Migrations ready (8 total)
- [x] Foreign keys with CASCADE
- [x] Unique constraints configured

### 3. Security ✅

- [x] Authentication on all mutations
- [x] Quiz answers never exposed
- [x] Enrollment verification
- [x] Input validation
- [x] SQL injection protected (Prisma)

---

## 🔧 ENVIRONMENT SETUP

### Required Environment Variables

```bash
# 1. Database (Supabase)
DATABASE_URL="postgresql://..."

# 2. NextAuth (CRITICAL - Generate new secret!)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# 3. Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# 4. Email (Optional)
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@yourdomain.com"
```

### Generate Secure Secret

```bash
# Run this command to generate NEXTAUTH_SECRET
openssl rand -base64 32
```

**IMPORTANT:** Never reuse development secrets in production!

---

## 📦 DEPLOYMENT STEPS

### Option 1: Deploy to Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel Dashboard
# Go to: Project Settings → Environment Variables
```

### Option 2: Deploy to Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build

# 4. Deploy
netlify deploy --prod
```

### Option 3: Deploy to Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize
railway init

# 4. Deploy
railway up
```

---

## 🗄️ DATABASE MIGRATION

### Verify Migrations Status

```bash
# Check migration status
npx prisma migrate status

# Expected output:
# ✔ All migrations applied (8)
```

### Apply Migrations to Production

```bash
# IMPORTANT: Backup database first!

# Apply all pending migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

### Rollback Plan

```bash
# If something goes wrong, restore from backup
# Supabase provides automatic backups

# Or manually reset (DEVELOPMENT ONLY):
npx prisma migrate reset
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### 1. Test OAuth Login Flow

```bash
# Visit your production URL
https://yourdomain.com/login

# Click "Sign in with Google"
# Verify redirect works
# Verify user created in database
```

### 2. Test API Endpoints

```bash
# Test enrollment
curl -X POST https://yourdomain.com/api/courses/COURSE_ID/enroll \
  -H "Cookie: next-auth.session-token=TOKEN"

# Test progress
curl -X GET https://yourdomain.com/api/courses/COURSE_ID/progress \
  -H "Cookie: next-auth.session-token=TOKEN"

# Test quiz
curl -X GET https://yourdomain.com/api/courses/COURSE_ID/quiz/QUIZ_ID \
  -H "Cookie: next-auth.session-token=TOKEN"
```

### 3. Verify Database Connections

```bash
# Check Prisma connection
npx prisma db pull

# Should show all 8 migrations applied
```

### 4. Monitor Error Logs

```bash
# Vercel
vercel logs --prod

# Check for:
# - Database connection errors
# - OAuth errors
# - API failures
```

---

## 🎯 CONFIGURATION CHECKLIST

### Google OAuth Setup

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add Authorized Redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID and Secret to environment variables

### Supabase Setup

1. Create new project on Supabase
2. Copy Database URL from Settings → Database → Connection String
3. Use "Transaction Pooling" URL for production
4. Enable RLS (Row Level Security) if needed
5. Configure backups (automatic on paid plans)

### Domain Configuration

1. Add custom domain in hosting platform
2. Update NEXTAUTH_URL to production domain
3. Update Google OAuth redirect URLs
4. Configure SSL certificate (automatic on Vercel/Netlify)

---

## 📊 MONITORING & MAINTENANCE

### Set Up Monitoring

```bash
# Vercel Analytics (Free)
# Add to package.json:
npm install @vercel/analytics

# In layout.tsx:
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Database Performance

```bash
# Monitor slow queries in Supabase Dashboard
# Settings → Database → Query Performance

# Add indexes if needed (see DEPLOYMENT_CHECKLIST.md)
```

### Error Tracking

- **Vercel**: Built-in error tracking in dashboard
- **Sentry**: Recommended for detailed error monitoring
- **Supabase**: Check logs in Dashboard → Logs

---

## 🆘 TROUBLESHOOTING

### Common Issues

#### 1. OAuth Not Working

**Problem:** "Error 400: redirect_uri_mismatch"

**Solution:**

- Check NEXTAUTH_URL matches your domain
- Verify Google OAuth redirect URI includes `/api/auth/callback/google`
- Clear browser cookies and try again

#### 2. Database Connection Failed

**Problem:** "Can't reach database server"

**Solution:**

- Verify DATABASE_URL is correct
- Check if IP is whitelisted in Supabase (not needed for connection pooler)
- Use transaction pooling URL (port 6543, not 5432)

#### 3. Environment Variables Not Loading

**Problem:** Variables undefined in production

**Solution:**

- Verify all variables set in hosting platform
- Restart deployment after adding variables
- Check for typos in variable names
- Prefix client variables with `NEXT_PUBLIC_`

#### 4. Prisma Client Not Found

**Problem:** "@prisma/client" cannot be found

**Solution:**

```bash
# Regenerate Prisma Client
npx prisma generate

# Rebuild
npm run build
```

---

## 📝 MAINTENANCE CHECKLIST

### Daily

- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Verify backups running

### Weekly

- [ ] Review user feedback
- [ ] Check database performance
- [ ] Update dependencies (if needed)

### Monthly

- [ ] Rotate NEXTAUTH_SECRET
- [ ] Review and optimize slow queries
- [ ] Update documentation
- [ ] Security audit

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

✅ Users can sign in with Google  
✅ Course enrollment works  
✅ Progress tracking updates in real-time  
✅ Quizzes can be taken and scored  
✅ Results appear on leaderboard  
✅ No errors in production logs  
✅ SSL certificate active (https)  
✅ All API endpoints responding < 500ms

---

## 📚 ADDITIONAL RESOURCES

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [NextAuth Configuration](https://next-auth.js.org/configuration/options)

---

## 🚨 EMERGENCY CONTACTS

**Hosting Issues:**

- Vercel: https://vercel.com/support
- Netlify: https://www.netlify.com/support
- Railway: https://railway.app/help

**Database Issues:**

- Supabase: https://supabase.com/support

**OAuth Issues:**

- Google Cloud: https://cloud.google.com/support

---

**Good luck with your deployment!** 🚀

For detailed technical information, see: `DEPLOYMENT_CHECKLIST.md`
