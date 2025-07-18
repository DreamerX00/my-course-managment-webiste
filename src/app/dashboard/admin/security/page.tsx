'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { SummaryCards } from '@/components/admin/security/SummaryCards';
import { SecuritySettings } from '@/components/admin/security/SecuritySettings';
import { UserTable } from '@/components/admin/security/UserTable';

export default function SecurityPage() {
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

  if (session?.user?.role !== UserRole.OWNER) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p>You do not have the required permissions to view this page.</p>
        <p className="text-sm mt-2">Only users with the 'OWNER' role can access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security & Permissions</h1>
          <p className="mt-1 text-md text-gray-600">
            Manage users and platform-wide security settings. This panel is only visible to the Owner.
          </p>
        </div>

        <div className="space-y-12">
          {/* Placeholder for SummaryCards */}
          <div className="bg-white rounded-lg shadow p-6">
             <h3 className="text-xl font-semibold text-gray-800 mb-4">Access Overview</h3>
             <SummaryCards />
          </div>

          {/* Placeholder for UserTable */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">User Management</h3>
            <UserTable />
          </div>

          {/* Placeholder for SecuritySettings */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Global Security Settings</h3>
            <SecuritySettings />
          </div>
        </div>
      </div>
    </div>
  );
} 