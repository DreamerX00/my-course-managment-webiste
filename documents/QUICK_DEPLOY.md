# 🚀 QUICK DEPLOYMENT CHECKLIST

**Use this as your go-to guide for deploying to production**

---

## ⚡ PRE-DEPLOYMENT (5 minutes)

### 1. Verify Local Build ✅

```bash
npx tsc --noEmit    # No TypeScript errors
npm run build       # Build succeeds
```

### 2. Generate Production Secret 🔐

```bash
openssl rand -base64 32
```

**Save this for NEXTAUTH_SECRET!**

### 3. Prepare Environment Variables 📝

Have these ready:

- [ ] `DATABASE_URL` (from Supabase)
- [ ] `NEXTAUTH_URL` (your domain)
- [ ] `NEXTAUTH_SECRET` (from step 2)
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `VERCEL_TOKEN` (from vercel.com/account/tokens)
- [ ] `VERCEL_ORG_ID` (from Vercel project settings)
- [ ] `VERCEL_PROJECT_ID` (from Vercel project settings)

---

## 🔐 GITHUB SECRETS SETUP (3 minutes)

```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

Add each secret from the list above.

---

## 🚀 DEPLOY TO VERCEL (2 minutes)

### Option A: Through Vercel Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables
4. Click **Deploy**

### Option B: Through GitHub Actions (Automated)

1. Push code to GitHub:

```bash
git add .
git commit -m "feat: ready for production deployment"
git push origin main
```

2. GitHub Actions will automatically:
   - Run all CI checks
   - Deploy to Vercel
   - Apply database migrations

---

## 📋 POST-DEPLOYMENT (5 minutes)

### 1. Update Google OAuth

Go to: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

Add redirect URI:

```
https://your-project-name.vercel.app/api/auth/callback/google
```

### 2. Test Application

- [ ] Homepage loads: `https://your-project-name.vercel.app`
- [ ] Login works (Google OAuth)
- [ ] Database connected (check user table)
- [ ] API endpoints respond

### 3. Monitor Logs

**Vercel Dashboard:**

```
Project → Deployments → Latest → Runtime Logs
```

**GitHub Actions:**

```
Repository → Actions → Latest workflow run
```

---

## 🐛 QUICK TROUBLESHOOTING

| Issue          | Solution                                       |
| -------------- | ---------------------------------------------- |
| OAuth error    | Update Google OAuth redirect URIs              |
| Database error | Check `DATABASE_URL` format                    |
| Build failed   | Run `npm run build` locally first              |
| Prisma error   | Verify migrations: `npx prisma migrate status` |
| 500 error      | Check Vercel runtime logs                      |

---

## ✅ SUCCESS CHECKLIST

Your deployment is successful when:

- [ ] ✅ Homepage loads without errors
- [ ] ✅ Can sign in with Google
- [ ] ✅ User session persists after login
- [ ] ✅ Database connection working
- [ ] ✅ API endpoints return data
- [ ] ✅ HTTPS certificate active (🔒)
- [ ] ✅ No errors in logs

---

## 🎯 TOTAL TIME: ~15 MINUTES

**Pre-deployment:** 5 min  
**Setup Secrets:** 3 min  
**Deploy:** 2 min  
**Post-deployment:** 5 min

---

## 📞 SUPPORT

- **Vercel:** [vercel.com/support](https://vercel.com/support)
- **GitHub Actions:** [GitHub Community](https://github.com/community)
- **Prisma:** [prisma.io/docs](https://www.prisma.io/docs)

---

## 📚 DETAILED GUIDES

Need more details? Check these:

- `VERCEL_DEPLOYMENT.md` - Complete Vercel guide
- `GITHUB_ACTIONS_SETUP.md` - CI/CD setup guide
- `DEPLOYMENT_CHECKLIST.md` - Full validation checklist
- `QUICK_DEPLOYMENT_GUIDE.md` - Step-by-step deployment

---

**Last Updated:** October 27, 2025  
**Keep this handy for quick deployments!** 🚀
