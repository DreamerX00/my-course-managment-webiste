'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { UserManagementDashboard } from '@/components/admin/user-management/UserManagementDashboard';

export default function UserManagementPage() {
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

  // Only allow Admin and Instructor roles
  if (session?.user?.role !== UserRole.ADMIN && session?.user?.role !== UserRole.INSTRUCTOR) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You do not have the required permissions to view this page.</p>
        <p className="text-sm mt-2">Only users with 'ADMIN' or 'INSTRUCTOR' roles can access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-md text-gray-600">
            Manage user participation, course assignments, and platform engagement.
          </p>
        </div>

        <UserManagementDashboard />
      </div>
    </div>
  );
} 