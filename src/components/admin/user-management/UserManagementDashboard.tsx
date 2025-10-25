'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';
import { UserTable } from './UserTable';
import { UserRoleTabs } from './UserRoleTabs';
import { InviteUserForm } from './InviteUserForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Download, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  status: string;
  createdAt: string;
  coursesEnrolled: number;
  lastActive: string | null;
};

export function UserManagementDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const isAdmin = session?.user?.role === UserRole.ADMIN || session?.user?.role === UserRole.OWNER;

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, selectedRole, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/user-management/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      alert('Please select users first');
      return;
    }

    switch (action) {
      case 'export':
        exportToCSV();
        break;
      case 'message':
        // TODO: Implement bulk messaging
        alert('Bulk messaging feature coming soon');
        break;
      case 'assign-course':
        // TODO: Implement bulk course assignment
        alert('Bulk course assignment feature coming soon');
        break;
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Courses Enrolled', 'Join Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.name || '',
        user.email || '',
        user.role,
        user.coursesEnrolled,
        new Date(user.createdAt).toLocaleDateString(),
        user.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  const handleUserDelete = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowInviteForm(true)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Invite User
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={selectedUsers.length === 0}>
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('message')}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('assign-course')}>
                    <Users className="mr-2 h-4 w-4" />
                    Assign to Course
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Role Tabs */}
      <UserRoleTabs
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        userCounts={{
          all: users.length,
          student: users.filter(u => u.role === UserRole.STUDENT).length,
          instructor: users.filter(u => u.role === UserRole.INSTRUCTOR).length,
          admin: users.filter(u => u.role === UserRole.ADMIN).length,
          guest: users.filter(u => u.role === UserRole.GUEST).length,
        }}
      />

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        loading={loading}
        selectedUsers={selectedUsers}
        onSelectionChange={setSelectedUsers}
        onUserUpdate={handleUserUpdate}
        onUserDelete={handleUserDelete}
        isAdmin={isAdmin}
        onRefresh={fetchUsers}
      />

      {/* Invite User Modal */}
      {showInviteForm && (
        <InviteUserForm
          onClose={() => setShowInviteForm(false)}
          onSuccess={() => {
            setShowInviteForm(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
} 