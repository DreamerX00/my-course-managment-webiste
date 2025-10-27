# 🔄 CI/CD SETUP GUIDE - GitHub Actions

**Platform:** GitHub Actions  
**Target:** Vercel Deployment  
**Last Updated:** October 27, 2025

---

## 📋 OVERVIEW

This repository includes automated CI/CD pipelines using GitHub Actions that:

✅ **Validate code quality** (ESLint, TypeScript)  
✅ **Test builds** before deployment  
✅ **Check database migrations** (Prisma)  
✅ **Run security audits** (npm audit)  
✅ **Auto-deploy to Vercel** (production)

---

## 📂 WORKFLOWS

### 1. **ci-cd.yml** - Main CI/CD Pipeline

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs:**

1. **Lint & Type Check** - ESLint + TypeScript validation
2. **Build Test** - Verify Next.js builds successfully
3. **Security Audit** - npm audit + dependency check
4. **Prisma Check** - Validate schema and migrations
5. **Deploy to Vercel** - Deploy to production (main branch only)
6. **Notifications** - Success/failure notifications

**Workflow Diagram:**

```
Code Push → Lint → Build → Security → Prisma → Deploy → Notify
                ↓         ↓          ↓         ↓
              Pass      Pass       Pass      Pass
```

### 2. **pull-request.yml** - PR Validation

**Triggers:**

- Pull requests to `main` branch

**Jobs:**

1. Type check with TypeScript
2. Lint with ESLint
3. Test build
4. Comment on PR with status

**Purpose:** Quick validation for pull requests before merge

### 3. **deploy.yml** - Production Deployment

**Triggers:**

- Push to `main` branch
- Manual workflow dispatch

**Jobs:**

1. Deploy to Vercel production

**Purpose:** Fast deployment without full CI checks (use after CI passes)

---

## 🔑 GITHUB SECRETS SETUP

You need to configure these secrets in your GitHub repository:

### 1. Navigate to Repository Settings

```
Your Repository → Settings → Secrets and variables → Actions → New repository secret
```

### 2. Add Required Secrets

#### **Database Secrets**

**SECRET_NAME:** `DATABASE_URL`  
**VALUE:** Your Supabase connection string

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### **NextAuth Secrets**

**SECRET_NAME:** `NEXTAUTH_URL`  
**VALUE:** Your production URL

```
https://your-project-name.vercel.app
```

**SECRET_NAME:** `NEXTAUTH_SECRET`  
**VALUE:** Generated secret (DO NOT reuse dev secret)

```bash
# Generate with:
openssl rand -base64 32
```

#### **Vercel Deployment Secrets**

**SECRET_NAME:** `VERCEL_TOKEN`  
**HOW TO GET:**

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create new token
3. Name: "GitHub Actions CI/CD"
4. Scope: Full Account
5. Copy token value

**SECRET_NAME:** `VERCEL_ORG_ID`  
**HOW TO GET:**

1. Go to Vercel project settings
2. Copy "Organization ID" from General tab
3. Or run: `vercel env ls` and find `VERCEL_ORG_ID`

**SECRET_NAME:** `VERCEL_PROJECT_ID`  
**HOW TO GET:**

1. Go to Vercel project settings
2. Copy "Project ID" from General tab
3. Or check `.vercel/project.json` after first Vercel CLI deployment

#### **Optional Secrets**

If you use these features, add:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
EMAIL_SERVER
EMAIL_FROM
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

## 🚀 QUICK START

### 1. Enable GitHub Actions

GitHub Actions is enabled by default. Just push your code!

### 2. Add Secrets

Add all required secrets listed above to your repository.

### 3. Push to Main Branch

```bash
git add .
git commit -m "feat: add CI/CD workflows"
git push origin main
```

### 4. Monitor Workflow

Go to **Actions** tab in your GitHub repository to see workflows running.

---

## 📊 WORKFLOW STATUS BADGES

Add these badges to your `README.md`:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
![Deployment](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Deploy%20to%20Vercel/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values.

---

## 🔧 CUSTOMIZATION

### Change Node Version

Edit in workflow files:

```yaml
env:
  NODE_VERSION: "20.x" # Change to 18.x, 21.x, etc.
```

### Add More Branches

```yaml
on:
  push:
    branches: [main, develop, staging] # Add more branches
```

### Skip CI for Certain Commits

Add to commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

### Run Workflows Manually

1. Go to **Actions** tab
2. Select workflow
3. Click **Run workflow**
4. Choose branch
5. Click **Run workflow** button

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Secret not found"

**Error:**

```
Error: Secret DATABASE_URL not found
```

**Solution:**

1. Verify secret name is exact (case-sensitive)
2. Check secret is added in correct repository
3. Ensure secret has a value (not empty)

### Issue 2: "Vercel deployment failed"

**Error:**

```
Error: Failed to deploy to Vercel
```

**Solution:**

1. Verify `VERCEL_TOKEN` is valid
2. Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
3. Ensure Vercel project exists
4. Try deploying manually first: `vercel --prod`

### Issue 3: "Prisma generate failed"

**Error:**

```
Error: Prisma schema not found
```

**Solution:**

1. Verify `prisma/schema.prisma` exists in repository
2. Check file is not in `.gitignore`
3. Ensure Prisma is in `dependencies`, not `devDependencies`

### Issue 4: "Build failed"

**Error:**

```
Error: Type check failed
```

**Solution:**

1. Run locally: `npx tsc --noEmit`
2. Fix TypeScript errors
3. Run locally: `npm run build`
4. Push fixed code

### Issue 5: "Workflow not running"

**Problem:** Pushed code but workflow didn't trigger

**Solution:**

1. Check `.github/workflows/` files are in repository
2. Verify YAML syntax is correct
3. Check branch name matches trigger
4. Ensure GitHub Actions is enabled in repo settings

---

## 📈 MONITORING

### View Workflow Runs

```
Repository → Actions tab → Select workflow → View runs
```

### Check Logs

1. Click on workflow run
2. Click on job name
3. Expand step to view logs
4. Download logs if needed

### Email Notifications

GitHub automatically sends emails on:

- Workflow failures (author gets notified)
- First workflow run in a repo
- Workflow re-run results

**Configure:**

```
GitHub Settings → Notifications → Actions
```

---

## 🎯 BEST PRACTICES

### 1. **Branch Protection Rules**

Set up branch protection:

```
Repository → Settings → Branches → Add rule
```

**Recommended Settings:**

- ✅ Require status checks before merging
- ✅ Require branches to be up to date
- ✅ Require pull request reviews
- ✅ Include administrators

### 2. **Caching Dependencies**

Our workflows use caching:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: "npm" # Caches node_modules
```

**Benefits:**

- Faster builds (30-50% time reduction)
- Lower bandwidth usage
- Reduced GitHub Actions minutes

### 3. **Security**

- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Rotate secrets every 90 days
- ✅ Use `continue-on-error: true` for non-critical steps
- ✅ Review third-party actions before using

### 4. **Performance**

- Use `npm ci` instead of `npm install` (faster, more reliable)
- Enable caching for dependencies
- Run tests in parallel when possible
- Use specific action versions (not `@latest`)

---

## 🔄 WORKFLOW LIFECYCLE

### Development Flow

```
1. Create feature branch
   ↓
2. Make changes
   ↓
3. Commit and push
   ↓
4. CI/CD runs on push (optional)
   ↓
5. Create Pull Request
   ↓
6. PR workflow runs
   ↓
7. Review and merge
   ↓
8. Main workflow runs
   ↓
9. Auto-deploy to Vercel
   ↓
10. Production live!
```

### Recommended Branch Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

---

## 📝 WORKFLOW YAML REFERENCE

### Basic Structure

```yaml
name: Workflow Name

on:
  push:
    branches: [main]

jobs:
  job-name:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
```

### Common Actions

```yaml
# Checkout code
- uses: actions/checkout@v4

# Setup Node.js
- uses: actions/setup-node@v4
  with:
    node-version: "20.x"
    cache: "npm"

# Upload artifacts
- uses: actions/upload-artifact@v4
  with:
    name: build
    path: .next

# Download artifacts
- uses: actions/download-artifact@v4
  with:
    name: build
    path: .next

# Create GitHub comment
- uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: 'Comment text'
      })
```

---

## 🎓 LEARNING RESOURCES

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Prisma CI/CD Guide](https://www.prisma.io/docs/guides/deployment/deployment)

---

## ✅ CHECKLIST

Before enabling CI/CD:

- [ ] All secrets added to GitHub repository
- [ ] Workflow files in `.github/workflows/` directory
- [ ] Vercel project created and connected
- [ ] Database connection string tested
- [ ] Local build successful (`npm run build`)
- [ ] TypeScript check passing (`npx tsc --noEmit`)
- [ ] `.gitignore` updated to exclude sensitive files
- [ ] Branch protection rules configured (optional)

---

## 🚀 DEPLOYMENT SUMMARY

Once configured:

1. **Push to any branch** → CI checks run
2. **Create PR** → PR workflow validates changes
3. **Merge to main** → Auto-deploy to Vercel production
4. **Monitor** → Check Actions tab for status

**Result:** Automated, tested deployments with every merge!

---

**Last Updated:** October 27, 2025  
**Maintained By:** Development Team

For Vercel-specific deployment info, see: `VERCEL_DEPLOYMENT.md`
