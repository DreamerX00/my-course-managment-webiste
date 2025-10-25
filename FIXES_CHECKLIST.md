# 🔧 Fixes Checklist

This document provides a step-by-step checklist for implementing all recommended fixes from the audit.

---

## ✅ Phase 1: Critical Fixes (Do First)

### 1.1 Fix Prisma Client Singleton
- [ ] Update `src/lib/db.ts` with singleton pattern
- [ ] Remove duplicate PrismaClient in `src/lib/auth-options.ts`
- [ ] Update `src/lib/auth-options.ts` to import from `db.ts`
- [ ] Test database connections work correctly

**File:** `src/lib/db.ts`
```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
```

**File:** `src/lib/auth-options.ts`
```typescript
// Remove: const prisma = new PrismaClient();
// Add: import { db } from '@/lib/db';
// Replace all: prisma -> db
```

---

### 1.2 Environment Variable Security
- [ ] Create `src/lib/env.ts` with validation
- [ ] Add validation call in `src/app/layout.tsx`
- [ ] Remove hardcoded fallback secrets
- [ ] Create `.env.example` file ✅ (Done by audit)
- [ ] Add `.env` to `.gitignore` (verify)

**File:** `src/lib/env.ts`
```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }
}

// Call this at app startup
if (typeof window === 'undefined') {
  validateEnv();
}
```

---

### 1.3 Fix Authentication Configuration
- [ ] Update `src/lib/auth-options.ts` - remove secret fallback
- [ ] Update `src/lib/auth.ts` - remove secret fallback
- [ ] Add proper error handling for missing credentials
- [ ] Test authentication flow

**Changes needed:**
```typescript
// Before:
secret: process.env.NEXTAUTH_SECRET || "super-secret-development-key",

// After:
secret: process.env.NEXTAUTH_SECRET,
// The validateEnv() will catch missing secrets
```

---

### 1.4 Update Middleware for Authorization
- [ ] Update `src/middleware.ts` with role-based checks
- [ ] Create `/unauthorized` page
- [ ] Test admin route protection
- [ ] Test student route protection

**File:** `src/middleware.ts`
```typescript
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    
    // Admin routes require ADMIN or OWNER role
    if (path.startsWith("/dashboard/admin")) {
      if (!token || !["ADMIN", "OWNER"].includes(token.role as string)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*/start",
    "/courses/:path*/learn",
    "/profile/:path*",
  ],
}
```

---

### 1.5 Add Missing Image Domains
- [ ] Update `next.config.ts` with all image domains
- [ ] Audit codebase for external image URLs
- [ ] Test all images load correctly

**File:** `next.config.ts` - Add to `remotePatterns`:
```typescript
{
  protocol: 'https',
  hostname: 'images.unsplash.com',
},
{
  protocol: 'https',
  hostname: 'lh3.googleusercontent.com',
},
// Add others as discovered
```

---

## ✅ Phase 2: Fix ESLint Errors (Priority Files)

### 2.1 API Routes - Fix Unused Variables

#### File: `src/app/api/admin/content-settings/route.ts`
- [ ] Line 6: Remove unused `req` parameter or prefix with `_`
- [ ] Lines 19, 25, 47, 71, 76, 80, 108: Replace `console.log` with logger

#### File: `src/app/api/admin/platform-settings/route.ts`
- [ ] Line 8: Remove unused `req` parameter

#### File: `src/app/api/admin/stats/route.ts`
- [ ] Line 6: Remove unused `req` parameter

#### File: `src/app/api/admin/users/stats/route.ts`
- [ ] Line 7: Remove unused `req` parameter

#### File: `src/app/api/admin/users/[userId]/route.ts`
- [ ] Line 20: Remove or use `status` variable

#### File: `src/app/api/content-settings/route.ts`
- [ ] Line 4: Remove unused `req` parameter

---

### 2.2 API Routes - Fix Type Safety

#### File: `src/app/api/courses/route.ts`
- [ ] Line 38: Type `acc` parameter (should be `number`)
- [ ] Line 38: Type `chapter` parameter (create interface)
- [ ] Line 76: Type `adminCategories` parameter (create interface)

**Create type definitions:**
```typescript
interface ChapterWithContent {
  lessons: { id: string }[];
  subchapters: { id: string }[];
}

interface AdminCategory {
  id: string;
  name: string;
  color: string;
  order: number;
}
```

#### File: `src/app/api/courses/[courseId]/chapters/[chapterId]/route.ts`
- [ ] Line 34: Type the body parsing

#### File: `src/app/api/courses/[courseId]/chapters/[chapterId]/subchapters/[subchapterId]/route.ts`
- [ ] Line 15: Type the body parsing

#### File: `src/app/api/courses/[courseId]/route.ts`
- [ ] Line 65: Type the body parsing

---

### 2.3 API Routes - Fix Error Handling

**Files with unused error variables:**
- [ ] `src/app/api/courses/[courseId]/chapters/reorder/route.ts` (lines 5, 22)
- [ ] `src/app/api/courses/[courseId]/chapters/route.ts` (lines 5, 15, 42)
- [ ] `src/app/api/courses/[courseId]/chapters/[chapterId]/lessons/route.ts` (lines 5, 8, 15, 21, 43)
- [ ] `src/app/api/courses/[courseId]/chapters/[chapterId]/route.ts` (lines 20, 45, 59)
- [ ] `src/app/api/courses/[courseId]/chapters/[chapterId]/subchapters/reorder/route.ts` (line 21)
- [ ] `src/app/api/courses/[courseId]/chapters/[chapterId]/subchapters/route.ts` (lines 14, 42)
- [ ] `src/app/api/courses/[courseId]/chapters/[chapterId]/subchapters/[subchapterId]/route.ts` (lines 25, 39)
- [ ] `src/app/api/courses/[courseId]/route.ts` (line 49)

**Fix pattern:**
```typescript
// Before:
} catch (error) {
  return NextResponse.json({ error: 'Failed' }, { status: 500 });
}

// After:
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'Failed', details: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  );
}
```

---

### 2.4 Pages - Fix Type Safety

#### File: `src/app/auth/signup/page.tsx`
- [ ] Line 23: Type the `error` parameter properly
- [ ] Line 31: Add `validateInvitation` to useEffect deps or use useCallback
- [ ] Line 44: Log or use the error
- [ ] Line 88: Log or use the error
- [ ] Line 163: Escape apostrophe: `Don&apos;t`

#### File: `src/app/courses/create/page.tsx`
- [ ] Line 8: Remove unused `Textarea` import
- [ ] Line 80: Log or use the error

#### File: `src/app/courses/page.tsx`
- [ ] Line 34: Type the settings parameter
- [ ] Line 88: Change `let filtered` to `const filtered`
- [ ] Line 134: Type the `cat` parameter
- [ ] Line 193: Type both parameters in the reduce callback

#### File: `src/app/courses/[courseId]/page.tsx`
- [ ] Line 138: Add type guard or proper typing
- [ ] Lines 179, 216: Replace `<img>` with Next.js `<Image>`
- [ ] Lines 264, 314: Escape apostrophes

---

### 2.5 Admin Pages - Major Cleanup

#### File: `src/app/dashboard/admin/page.tsx` (30+ issues)
- [ ] Remove unused state variables (lines 54-74)
- [ ] Remove unused functions (lines 244, 281, 302)
- [ ] Fix console.log statements (lines 139, 155, 161, 183)
- [ ] Type all `any` parameters (lines 61, 237, 258, 302)

**Recommended:** Refactor this entire file - it's doing too much

#### File: `src/app/dashboard/admin/courses/[courseId]/content/page.tsx` (25+ issues)
- [ ] Remove unused imports (lines 4, 19)
- [ ] Remove unused state (lines 37, 39, 40, 48, 55, 56, 125)
- [ ] Type all `any` parameters (lines 53, 54, 71, 72, 75, 170, 386, 407, 729)
- [ ] Replace console.log with proper logging (lines 140, 142, 147, 158, 167, 345, 347, 352)

#### File: `src/app/dashboard/admin/layout.tsx`
- [ ] Lines 38 (multiple): Escape apostrophes

---

### 2.6 Other Pages

#### File: `src/app/courses/[courseId]/learn/page.tsx`
- [ ] Line 27: Remove or use `data` variable
- [ ] Line 51: Log or use the error

#### File: `src/app/courses/[courseId]/quiz/page.tsx`
- [ ] Line 30: Remove or use `data` variable
- [ ] Line 55: Log or use the error
- [ ] Line 104: Log or use the error

#### File: `src/app/courses/[courseId]/start/page.tsx`
- [ ] Line 14: Type the `content` parameter
- [ ] Line 168: Remove or use `data` variable
- [ ] Line 201: Remove unused `isSubchapter` parameter

#### File: `src/app/dashboard/admin/content-management/page.tsx`
- [ ] Line 8: Remove unused imports
- [ ] Line 11: Remove unused `Settings` import
- [ ] Line 65: Add `fetchSettings` to useEffect deps

#### File: `src/app/dashboard/admin/courses/[courseId]/content-details/page.tsx`
- [ ] Line 3: Remove unused `useEffect` import
- [ ] Line 162: Remove unused `loadContentDetails`
- [ ] Line 212: Log or use the error

---

## ✅ Phase 3: React & Next.js Best Practices

### 3.1 Replace <img> with <Image>
- [ ] `src/app/courses/[courseId]/page.tsx` (lines 179, 216)
- [ ] Search project for other `<img` tags
- [ ] Update all instances
- [ ] Test image loading

### 3.2 Fix React Hook Dependencies
- [ ] `src/app/auth/signup/page.tsx` (line 31)
- [ ] `src/app/dashboard/admin/content-management/page.tsx` (line 65)
- [ ] Search for other "exhaustive-deps" warnings

### 3.3 Fix Unescaped Entities
- [ ] `src/app/auth/signup/page.tsx` (line 163)
- [ ] `src/app/courses/[courseId]/page.tsx` (lines 264, 314)
- [ ] `src/app/dashboard/admin/layout.tsx` (line 38, multiple)
- [ ] Search for other unescaped apostrophes

---

## ✅ Phase 4: Database Optimizations

### 4.1 Add Database Indexes
- [ ] Update `prisma/schema.prisma` with indexes
- [ ] Create migration: `npx prisma migrate dev --name add_indexes`
- [ ] Apply to database
- [ ] Test query performance

**Add these indexes:**
```prisma
model Course {
  @@index([isPublished])
  @@index([createdAt])
  @@index([isPublished, createdAt])
}

model User {
  @@index([role])
  @@index([status])
  @@index([createdAt])
  @@index([email])
}

model Chapter {
  @@index([courseId, position])
  @@index([isPublished])
}

model Progress {
  @@index([userId, courseId])
}
```

---

### 4.2 Optimize Queries
- [ ] Add pagination to `src/app/api/courses/route.ts`
- [ ] Use `select` instead of `include` where possible
- [ ] Add query result caching (consider Redis)
- [ ] Measure query performance before/after

---

## ✅ Phase 5: Testing Infrastructure

### 5.1 Setup Testing
- [ ] Install dependencies: `npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom`
- [ ] Create `jest.config.js`
- [ ] Create `jest.setup.js`
- [ ] Add test scripts to `package.json`

### 5.2 Write Core Tests
- [ ] Authentication flow tests
- [ ] Course creation tests
- [ ] API endpoint tests
- [ ] User role permission tests

---

## ✅ Phase 6: Code Quality

### 6.1 Setup Logging
- [ ] Install: `npm install pino pino-pretty`
- [ ] Create `src/lib/logger.ts`
- [ ] Replace console.log with logger
- [ ] Add structured logging

### 6.2 Add Input Validation
- [ ] Install Zod (already installed ✅)
- [ ] Create validation schemas in `src/lib/validations/`
- [ ] Add validation to all API routes
- [ ] Add error handling for validation failures

### 6.3 Code Organization
- [ ] Create `src/services/` directory
- [ ] Extract business logic from API routes
- [ ] Create `src/types/` directory
- [ ] Define shared types
- [ ] Create `src/utils/` directory
- [ ] Consolidate utility functions

---

## ✅ Phase 7: Documentation

### 7.1 Update README.md
- [ ] Add prerequisites
- [ ] Add installation steps
- [ ] Add environment setup guide
- [ ] Add development workflow
- [ ] Add deployment guide

### 7.2 Create Additional Docs
- [ ] Create `CONTRIBUTING.md`
- [ ] Create `API_DOCUMENTATION.md`
- [ ] Create database ERD diagram
- [ ] Add JSDoc comments to key functions

---

## ✅ Phase 8: Configuration

### 8.1 Add Editor Configuration
- [ ] Create `.vscode/settings.json`
- [ ] Create `.prettierrc.json`
- [ ] Add `.editorconfig`

### 8.2 Setup Git Hooks
- [ ] Install: `npm install -D husky lint-staged`
- [ ] Setup pre-commit hooks
- [ ] Add linting to hooks
- [ ] Add test running to hooks

---

## 🎯 Progress Tracking

### Critical (Must Fix Before Production)
- [ ] Phase 1.1: Prisma Singleton
- [ ] Phase 1.2: Environment Validation
- [ ] Phase 1.3: Remove Hardcoded Secrets
- [ ] Phase 1.4: Fix Middleware

### High Priority
- [ ] Phase 2: Fix Top 50 ESLint Errors
- [ ] Phase 3: React Best Practices
- [ ] Phase 4: Database Optimizations

### Medium Priority
- [ ] Phase 5: Testing Infrastructure
- [ ] Phase 6: Code Quality
- [ ] Phase 7: Documentation

### Nice to Have
- [ ] Phase 8: Configuration Improvements

---

## 📊 Completion Tracking

**Overall Progress:** 0/200+ tasks

**Phase 1 (Critical):** 0/20 tasks  
**Phase 2 (ESLint):** 0/80 tasks  
**Phase 3 (React):** 0/15 tasks  
**Phase 4 (Database):** 0/10 tasks  
**Phase 5 (Testing):** 0/20 tasks  
**Phase 6 (Quality):** 0/30 tasks  
**Phase 7 (Docs):** 0/15 tasks  
**Phase 8 (Config):** 0/10 tasks  

---

**Note:** This checklist should be updated as tasks are completed. Consider using GitHub Issues or a project management tool to track progress.
