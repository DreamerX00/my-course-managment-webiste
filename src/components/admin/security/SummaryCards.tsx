'use client';

import { Users, ShieldCheck, UserCheck, UserX, GraduationCap } from 'lucide-react';
import { ElementType, useEffect, useState } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ElementType;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm p-6 flex items-start">
    <div className={`rounded-full p-3 mr-4 ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

interface Stats {
  totalUsers: number;
  admins: number;
  instructors: number;
  students: number;
  blocked: number;
}

export function SummaryCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-200 mr-4 float-left"></div>
            <div className="overflow-hidden">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
      <StatCard title="Admins" value={stats.admins} icon={ShieldCheck} color="bg-green-500" />
      <StatCard title="Instructors" value={stats.instructors} icon={UserCheck} color="bg-yellow-500" />
      <StatCard title="Students" value={stats.students} icon={GraduationCap} color="bg-purple-500" />
      <StatCard title="Blocked Accounts" value={stats.blocked} icon={UserX} color="bg-red-500" />
    </div>
  );
} 