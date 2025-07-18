'use client';

import { UserRole } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserRoleTabsProps {
  selectedRole: UserRole | 'ALL';
  onRoleChange: (role: UserRole | 'ALL') => void;
  userCounts: {
    all: number;
    student: number;
    instructor: number;
    admin: number;
    guest: number;
  };
}

export function UserRoleTabs({ selectedRole, onRoleChange, userCounts }: UserRoleTabsProps) {
  const tabs = [
    { role: 'ALL' as const, label: 'All Users', count: userCounts.all },
    { role: UserRole.STUDENT, label: 'Students', count: userCounts.student },
    { role: UserRole.INSTRUCTOR, label: 'Instructors', count: userCounts.instructor },
    { role: UserRole.ADMIN, label: 'Admins', count: userCounts.admin },
    { role: UserRole.GUEST, label: 'Guests', count: userCounts.guest },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b pb-4">
      {tabs.map((tab) => (
        <Button
          key={tab.role}
          variant={selectedRole === tab.role ? 'default' : 'outline'}
          onClick={() => onRoleChange(tab.role)}
          className="flex items-center gap-2"
        >
          {tab.label}
          <Badge variant="secondary" className="ml-1">
            {tab.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
} 