# Quick Reference: Supabase & Resend Integration

## 🔄 Using Supabase Client

### Client-Side Usage (Browser)

```typescript
import { supabase } from '@/lib/supabase';

// Example: Query data
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('isPublished', true);

// Example: Subscribe to real-time changes
const channel = supabase
  .channel('course-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'Course' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Example: Storage operations
const { data, error } = await supabase.storage
  .from('course-thumbnails')
  .upload(`${courseId}.jpg`, file);
```

### Server-Side Usage (API Routes, Server Actions)

```typescript
import { supabaseAdmin } from '@/lib/supabase';

// Use admin client for privileged operations
const { data, error } = await supabaseAdmin
  .from('users')
  .update({ role: 'ADMIN' })
  .eq('id', userId);

// Example: Create user with admin privileges
const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'user@example.com',
  password: 'secure-password',
  email_confirm: true,
});
```

### Check if Supabase is Configured

```typescript
import { isSupabaseConfigured } from '@/lib/supabase';

if (isSupabaseConfigured()) {
  // Supabase features are available
} else {
  // Fall back to Prisma only
}
```

## 📧 Using Resend for Emails

### Send Invitation Email

The `sendInvitationEmail` function is already integrated in your invitation system:

```typescript
import { sendInvitationEmail } from '@/lib/email';

// Example usage in API route
try {
  await sendInvitationEmail(
    'user@example.com',           // recipient email
    'John Doe',                    // user name (optional)
    'STUDENT',                     // role
    'Introduction to Web Dev',     // course name (optional)
    'Welcome to our platform!',    // personal message (optional)
    'https://yourapp.com/signup?token=xyz' // signup URL
  );
  
  return { success: true };
} catch (error) {
  return { success: false, error: 'Failed to send email' };
}
```

### Send Custom Emails

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send a simple email
const result = await resend.emails.send({
  from: 'Learning Platform <onboarding@resend.dev>',
  to: 'student@example.com',
  subject: 'Course Completion Certificate',
  html: '<h1>Congratulations!</h1><p>You completed the course!</p>',
});

// Send email with React component (optional)
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';

const html = render(<WelcomeEmail name="John" />);

await resend.emails.send({
  from: 'Learning Platform <onboarding@resend.dev>',
  to: 'student@example.com',
  subject: 'Welcome!',
  html: html,
});
```

## 🔗 Using Prisma with Supabase

Your existing Prisma setup works seamlessly with Supabase:

```typescript
import { db } from '@/lib/db';

// All your existing Prisma queries work the same
const courses = await db.course.findMany({
  where: { isPublished: true },
  include: { chapters: true },
});

// Transactions
await db.$transaction([
  db.user.update({ where: { id: userId }, data: { role: 'ADMIN' } }),
  db.invitation.delete({ where: { id: invitationId } }),
]);
```

## 🎨 Supabase Storage (File Uploads)

### Setup Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket (e.g., 'course-thumbnails')
3. Set bucket policies (public or private)

### Upload Files

```typescript
import { supabase } from '@/lib/supabase';

// Upload file
const uploadFile = async (file: File, courseId: string) => {
  const fileName = `${courseId}-${Date.now()}.${file.name.split('.').pop()}`;
  
  const { data, error } = await supabase.storage
    .from('course-thumbnails')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('course-thumbnails')
    .getPublicUrl(fileName);

  return publicUrl;
};

// Delete file
const deleteFile = async (filePath: string) => {
  const { error } = await supabase.storage
    .from('course-thumbnails')
    .remove([filePath]);

  if (error) throw error;
};
```

## 🔐 Authentication with Supabase + NextAuth

You can use either Supabase Auth or NextAuth. Here's how to integrate both:

### Option 1: Use NextAuth (Current Setup)

Your current setup uses NextAuth with Prisma adapter. Keep using it as is.

### Option 2: Add Supabase Auth (Advanced)

```typescript
// pages/api/auth/supabase-callback.ts
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { access_token, refresh_token } = req.query;

  if (access_token && refresh_token) {
    await supabase.auth.setSession({
      access_token: access_token as string,
      refresh_token: refresh_token as string,
    });
  }

  res.redirect('/');
}
```

## 📊 Real-Time Features with Supabase

### Listen to Database Changes

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Subscribe to course changes
    const channel = supabase
      .channel('courses-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Course' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCourses((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setCourses((prev) =>
              prev.map((c) => (c.id === payload.new.id ? payload.new : c))
            );
          } else if (payload.eventType === 'DELETE') {
            setCourses((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <div>{/* Render courses */}</div>;
}
```

## 🧪 Testing

### Test Database Connection

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

### Test Email Sending

```typescript
// Create a test API route: app/api/test-email/route.ts
import { sendInvitationEmail } from '@/lib/email';

export async function GET() {
  try {
    await sendInvitationEmail(
      'your-email@example.com',
      'Test User',
      'STUDENT',
      null,
      'This is a test email',
      'https://localhost:3000'
    );
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
```

Visit `http://localhost:3000/api/test-email` to test.

## 🚨 Common Issues

### Database Connection Errors

```typescript
// Check if DATABASE_URL is set correctly
console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);

// Test Prisma connection
import { db } from '@/lib/db';
await db.$queryRaw`SELECT 1`;
```

### Email Not Sending

```typescript
// Check Resend API key
console.log('RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY);

// Verify email domain (for custom domains)
// Make sure DNS records are properly configured in Resend dashboard
```

### Supabase Connection Issues

```typescript
// Verify Supabase configuration
import { isSupabaseConfigured } from '@/lib/supabase';

if (!isSupabaseConfigured()) {
  console.error('Supabase is not properly configured');
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
```

## 📝 Environment Variables Checklist

Make sure all these are set in your `.env` file:

- [ ] `DATABASE_URL` - Supabase PostgreSQL connection string
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `NEXTAUTH_URL` - Your application URL
- [ ] `NEXTAUTH_SECRET` - NextAuth secret key
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `EMAIL_FROM` - Email sender address

## 🎉 You're All Set!

Your application now uses:
- ✅ **Supabase** for PostgreSQL database (via Prisma)
- ✅ **Resend** for email delivery
- ✅ **NextAuth** for authentication
- ✅ Optional: Supabase Storage, Real-time, Auth

For more details, check `SETUP_GUIDE.md`!
