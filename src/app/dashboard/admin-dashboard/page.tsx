"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Settings,
  BarChart3,
  FileText,
  Shield,
  Plus,
  Edit3,
  Database,
  Activity,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
  completionRate: number;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = ["ADMIN", "INSTRUCTOR", "OWNER"].includes(userRole);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return; // Don't redirect while loading
    if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, router, status]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      try {
        setStatsLoading(true);
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Failed to fetch stats:", response.statusText);
          toast({
            title: "Error",
            description:
              "Failed to load dashboard statistics. Please refresh the page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. Please try again.",
          variant: "destructive",
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, toast]);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="mb-6 text-gray-700">
          You do not have permission to view this page.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const adminOptions = [
    {
      title: "Add/Edit Course",
      description: "Create new courses or modify existing ones",
      icon: BookOpen,
      href: "/dashboard/admin",
      color: "bg-blue-500 hover:bg-blue-600",
      iconColor: "text-blue-600",
    },
    {
      title: "Content Management",
      description: "Control explore page layout and homepage featured courses",
      icon: FileText,
      href: "/dashboard/admin/content-management",
      color: "bg-orange-500 hover:bg-orange-600",
      iconColor: "text-orange-600",
    },
    {
      title: "User Management",
      description: "Manage students, instructors, and user roles",
      icon: Users,
      href: "/dashboard/admin/user-management",
      color: "bg-green-500 hover:bg-green-600",
      iconColor: "text-green-600",
    },
    {
      title: "Analytics & Reports",
      description: "View course performance and user analytics",
      icon: BarChart3,
      href: "/dashboard/admin/analytics",
      color: "bg-purple-500 hover:bg-purple-600",
      iconColor: "text-purple-600",
    },
    {
      title: "System Settings",
      description: "Configure platform settings and preferences",
      icon: Settings,
      href: "/dashboard/admin/settings",
      color: "bg-gray-500 hover:bg-gray-600",
      iconColor: "text-gray-600",
    },
    {
      title: "Security & Permissions",
      description: "Manage access controls and security settings",
      icon: Shield,
      href: "/dashboard/admin/security",
      color: "bg-red-500 hover:bg-red-600",
      iconColor: "text-red-600",
      requiredRole: "OWNER",
    },
  ];

  const accessibleOptions = adminOptions.filter((option) => {
    if (!option.requiredRole) return true;
    return option.requiredRole === userRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 pt-24 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome back, {session?.user?.name}! Manage your course platform
            from here.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-700">
                Role: {userRole}
              </span>
            </span>
            <span className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-700">Admin Access</span>
            </span>
          </div>
        </motion.div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div
                        className={`p-4 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors`}
                      >
                        <IconComponent
                          className={`h-8 w-8 ${option.iconColor}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {option.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {option.description}
                        </p>
                      </div>
                      <Button
                        className={`w-full ${option.color} text-white`}
                        onClick={() => router.push(option.href)}
                      >
                        {option.title === "Add/Edit Course" ? (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add/Edit Course
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Manage
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Quick Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {statsLoading ? (
                      <div className="animate-pulse bg-blue-200 h-8 w-12 mx-auto rounded"></div>
                    ) : (
                      stats?.totalCourses.toLocaleString() || "0"
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Courses</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {statsLoading ? (
                      <div className="animate-pulse bg-green-200 h-8 w-16 mx-auto rounded"></div>
                    ) : (
                      stats?.totalStudents.toLocaleString() || "0"
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Active Students</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {statsLoading ? (
                      <div className="animate-pulse bg-purple-200 h-8 w-8 mx-auto rounded"></div>
                    ) : (
                      stats?.totalInstructors.toLocaleString() || "0"
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Instructors</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {statsLoading ? (
                      <div className="animate-pulse bg-orange-200 h-8 w-12 mx-auto rounded"></div>
                    ) : (
                      `${stats?.completionRate || 0}%`
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
