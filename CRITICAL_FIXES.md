# 🔧 Critical Fixes - Ready to Apply

This document contains copy-paste-ready code for the most critical fixes identified in the audit.

---

## 1. Fix Prisma Client Singleton (CRITICAL)

### File: `src/lib/db.ts`

**Replace entire file with:**

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

---

### File: `src/lib/auth-options.ts`

**Update:**

```typescript
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { db } from '@/lib/db'; // ✅ Import from db.ts instead of creating new instance

// ❌ Remove this line:
// const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db), // ✅ Use imported db instead of prisma
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // ✅ Use db instead of prisma
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role || "STUDENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.id) {
        return true;
      }
      
      // ✅ Use db instead of prisma
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
      });
      
      if (!dbUser) {
        await db.user.update({
          where: { id: user.id },
          data: { role: "STUDENT" },
        });
      }
      
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

---

## 2. Add Environment Variable Validation (CRITICAL)

### Create new file: `src/lib/env.ts`

```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
] as const;

export function validateEnv() {
  if (typeof window !== 'undefined') {
    // Skip validation on client side
    return;
  }

  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n\n` +
      missing.map(key => `  - ${key}`).join('\n') +
      `\n\nPlease check your .env file and ensure all required variables are set.\n` +
      `See .env.example for reference.\n`
    );
  }

  // Validate NEXTAUTH_SECRET length (should be at least 32 characters)
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && secret.length < 32) {
    console.warn(
      '⚠️  Warning: NEXTAUTH_SECRET should be at least 32 characters long for security.\n' +
      '   Generate a strong secret with: openssl rand -base64 32'
    );
  }

  console.log('✅ Environment variables validated successfully');
}

// Auto-validate on import (server-side only)
validateEnv();
```

---

### Update: `src/lib/auth-options.ts`

**Add at the top of the file:**

```typescript
import '@/lib/env'; // ✅ Import to trigger validation
import GoogleProvider from "next-auth/providers/google";
// ... rest of imports
```

---

## 3. Fix Middleware Authorization (CRITICAL)

### File: `src/middleware.ts`

**Replace entire file with:**

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
        const url = new URL("/unauthorized", req.url)
        url.searchParams.set("from", path)
        return NextResponse.redirect(url)
      }
    }
    
    // Instructor routes require INSTRUCTOR, ADMIN, or OWNER role
    if (path.startsWith("/dashboard/instructor")) {
      if (!token || !["INSTRUCTOR", "ADMIN", "OWNER"].includes(token.role as string)) {
        const url = new URL("/unauthorized", req.url)
        url.searchParams.set("from", path)
        return NextResponse.redirect(url)
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
    "/courses/:path*/quiz",
    "/profile/:path*",
  ],
}
```

---

### Create new file: `src/app/unauthorized/page.tsx`

```typescript
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const from = searchParams.get("from")

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page.
            {from && (
              <div className="mt-2 text-sm">
                Requested page: <code className="bg-gray-100 px-2 py-1 rounded">{from}</code>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            If you believe this is an error, please contact your administrator.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="flex-1"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => router.push("/dashboard")} 
              className="flex-1"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 4. Update Next.js Config (Already Applied ✅)

### File: `next.config.ts`

**Verify it looks like this:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint enabled for build - all warnings must be fixed
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript checking enabled for build
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

---

## 5. Add Database Indexes (HIGH PRIORITY)

### File: `prisma/schema.prisma`

**Add these indexes to existing models:**

```prisma
model Course {
  // ... existing fields ...

  @@index([isPublished])
  @@index([createdAt])
  @@index([isPublished, createdAt])
}

model User {
  // ... existing fields ...

  @@index([role])
  @@index([status])
  @@index([createdAt])
  @@index([email]) // email already has @unique, but index helps with lookups
}

model Chapter {
  // ... existing fields ...

  @@index([courseId, position])
  @@index([isPublished])
  @@index([courseId, isPublished])
}

model Progress {
  // ... existing fields ...

  @@index([userId, courseId])
  @@index([courseId])
}

model Lesson {
  // ... existing fields ...

  @@index([chapterId, position])
}

model Subchapter {
  // ... existing fields ...

  @@index([chapterId, position])
}

model Quiz {
  // ... existing fields ...

  @@index([chapterId])
}

model Question {
  // ... existing fields ...

  @@index([quizId])
}

model QuizAttempt {
  // ... existing fields ...

  @@index([userId])
  @@index([quizId])
  @@index([userId, quizId])
}

model Invitation {
  // ... existing fields ...

  @@index([email])
  @@index([used])
  @@index([expiresAt])
}
```

**After updating, run:**
```bash
npx prisma migrate dev --name add_performance_indexes
```

---

## 6. Fix Common API Route Patterns

### Pattern 1: Remove Unused Request Parameter

**Before:**
```typescript
export async function GET(req: NextRequest) {
  // req is never used
  try {
    const data = await db.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
export async function GET() { // ✅ Remove unused parameter
  try {
    const data = await db.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

---

### Pattern 2: Proper Error Handling

**Before:**
```typescript
try {
  // operation
} catch (error) {
  return NextResponse.json({ error: 'Failed' }, { status: 500 });
}
```

**After:**
```typescript
try {
  // operation
} catch (error) {
  console.error('Operation failed:', error);
  
  // Log error details for debugging
  if (error instanceof Error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
  }
  
  return NextResponse.json(
    { 
      error: 'Operation failed',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Unknown error')
        : undefined // Don't expose error details in production
    },
    { status: 500 }
  );
}
```

---

### Pattern 3: Fix 'any' Types

**Before:**
```typescript
function processData(items: any[]) {
  return items.map((item: any) => item.value);
}
```

**After:**
```typescript
interface Item {
  value: string;
  // ... other properties
}

function processData(items: Item[]) {
  return items.map((item) => item.value);
}
```

---

## 7. Replace img with Next.js Image

### Pattern: Image Component

**Before:**
```tsx
<img 
  src={user.avatar} 
  alt="User avatar"
  className="w-10 h-10 rounded-full"
/>
```

**After:**
```tsx
import Image from 'next/image';

<Image 
  src={user.avatar} 
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
```

**For dynamic images with unknown sizes:**
```tsx
<div className="relative w-10 h-10">
  <Image 
    src={user.avatar} 
    alt="User avatar"
    fill
    className="rounded-full object-cover"
  />
</div>
```

---

## 8. Fix React Hook Dependencies

### Pattern: useEffect with Missing Dependencies

**Before:**
```typescript
const validateInvitation = async () => {
  // validation logic
};

useEffect(() => {
  if (token) {
    validateInvitation();
  }
}, [token]); // ⚠️ Missing validateInvitation dependency
```

**After - Option 1 (Use useCallback):**
```typescript
const validateInvitation = useCallback(async () => {
  // validation logic
}, [/* dependencies of validation logic */]);

useEffect(() => {
  if (token) {
    validateInvitation();
  }
}, [token, validateInvitation]); // ✅ All dependencies included
```

**After - Option 2 (Inline function):**
```typescript
useEffect(() => {
  const validateInvitation = async () => {
    // validation logic
  };

  if (token) {
    validateInvitation();
  }
}, [token]); // ✅ No external dependencies
```

---

## 9. Fix Unescaped Entities

**Before:**
```tsx
<p>Don't miss out on this opportunity</p>
```

**After:**
```tsx
<p>Don&apos;t miss out on this opportunity</p>
```

**Common replacements:**
- `'` → `&apos;`
- `"` → `&quot;`
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`

---

## 10. Replace console.log with Proper Logging

### Create: `src/lib/logger.ts`

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: unknown;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;
    return levels.indexOf(level) >= levels.indexOf(currentLevel);
  }

  debug(message: string, data?: LogData) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: LogData) {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: LogData) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  error(message: string, error?: Error | LogData) {
    if (this.shouldLog('error')) {
      if (error instanceof Error) {
        console.error(`[ERROR] ${message}`, {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error(`[ERROR] ${message}`, error || '');
      }
    }
  }
}

export const logger = new Logger();
```

**Usage:**

**Before:**
```typescript
console.log('Course created:', courseId);
console.log('User logged in');
console.error('Failed to create course:', error);
```

**After:**
```typescript
import { logger } from '@/lib/logger';

logger.info('Course created', { courseId });
logger.info('User logged in');
logger.error('Failed to create course', error);
```

---

## Testing the Fixes

After applying the critical fixes, test with:

```bash
# 1. Check TypeScript compilation
npx tsc --noEmit

# 2. Run ESLint
npm run lint

# 3. Try to build
npm run build

# 4. Test database connection
npx prisma db push
npx prisma studio

# 5. Test authentication
npm run dev
# Navigate to /login and test OAuth
```

---

## Next Steps

1. Apply fixes in this order:
   - Fix 1 (Prisma Singleton) - CRITICAL
   - Fix 2 (Environment Validation) - CRITICAL
   - Fix 3 (Middleware) - CRITICAL
   - Fix 5 (Database Indexes) - HIGH
   - Other fixes as time permits

2. Test after each fix

3. Commit with clear messages:
   ```bash
   git add src/lib/db.ts src/lib/auth-options.ts
   git commit -m "fix: implement Prisma singleton pattern to prevent memory leaks"
   ```

4. Continue with other fixes from FIXES_CHECKLIST.md

---

**Remember:** Always test in development before deploying to production!
