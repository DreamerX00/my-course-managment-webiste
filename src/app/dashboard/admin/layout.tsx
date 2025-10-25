'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/api/auth/signin');
    },
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-700">Loading session...</p>
      </div>
    );
  }

  // Check if user has admin access
  const hasAdminAccess = session?.user?.role === UserRole.ADMIN || 
                        session?.user?.role === UserRole.INSTRUCTOR || 
                        session?.user?.role === UserRole.OWNER;

  if (!hasAdminAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You do not have the required permissions to view this page.</p>
        <p className="text-sm mt-2">Only users with &apos;ADMIN&apos;, &apos;INSTRUCTOR&apos;, or &apos;OWNER&apos; roles can access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - Full width for all admin pages */}
      <div className="">
        {children}
      </div>
    </div>
  );
} 