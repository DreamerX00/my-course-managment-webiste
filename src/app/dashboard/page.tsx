"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface DashboardStats {
  enrolledCount: number;
  completedCount: number;
  badgesEarned: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCount: 0,
    completedCount: 0,
    badgesEarned: 0,
  });
  const [loading, setLoading] = useState(true);

  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = ["ADMIN", "INSTRUCTOR", "OWNER"].includes(userRole);

  // Fetch real user stats
  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/user/stats");
        if (response.ok) {
          const data = await response.json();
          setStats({
            enrolledCount: data.enrolledCount || 0,
            completedCount: data.completedCount || 0,
            badgesEarned: data.badgesEarned || 0,
          });
        }
      } catch {
        // Silently fail, keep default values
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.id]);

  const statCards = [
    { label: "Courses Enrolled", value: stats.enrolledCount, icon: "📚" },
    { label: "Courses Completed", value: stats.completedCount, icon: "✅" },
    { label: "Badges Earned", value: stats.badgesEarned, icon: "🏅" },
  ];

  // User avatar or initials
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-100 via-yellow-100 to-pink-100 relative px-2 py-8">
      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.08 }}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 md:hidden"
        aria-label="Quick Action"
        onClick={() => (window.location.href = "/courses")}
      >
        <span className="text-2xl">➕</span>
      </motion.button>

      {/* User Avatar/Initials */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="mb-4 select-none"
      >
        {userImage ? (
          <Image
            src={userImage}
            alt={userName}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            priority
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-400 via-pink-400 to-yellow-300 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
            {initials}
          </div>
        )}
      </motion.div>

      {/* Animated Gradient Header */}
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
        className="text-4xl font-extrabold shimmer mb-2 text-center"
      >
        Welcome, {userName}!
      </motion.h1>
      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4, type: "spring" }}
        className="text-lg text-pink-700 mb-8 animate-pulse text-center"
      >
        Ready to continue your learning journey? 🚀
      </motion.p>

      {/* Animated Stat Cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {loading
          ? // Loading skeleton
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="dashboard-stat-card dashboard-stat-card-animate animate-pulse"
              >
                <div className="h-8 w-8 bg-gray-200 rounded mb-2 mx-auto"></div>
                <div className="h-6 w-12 bg-gray-200 rounded mb-1 mx-auto"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))
          : statCards.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 + idx * 0.15,
                  duration: 0.7,
                  type: "spring",
                }}
                className="dashboard-stat-card dashboard-stat-card-animate"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 text-center">
                  {stat.label}
                </div>
              </motion.div>
            ))}
      </div>

      {/* Main Actions */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95, rotate: -2 }}
      >
        <Link
          href="/courses"
          className="px-8 py-3 rounded-lg bg-linear-to-r from-yellow-400 to-pink-400 text-white font-bold text-lg shadow-lg hover:from-pink-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2"
        >
          <span className="text-2xl">📚</span> Explore Courses
        </Link>
      </motion.div>
      {isAdmin && (
        <motion.div
          className="mt-8"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95, rotate: 2 }}
        >
          <Link
            href="/dashboard/admin"
            className="px-8 py-3 rounded-lg bg-linear-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-lg hover:from-pink-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-2xl">🛠️</span> Admin Panel
          </Link>
        </motion.div>
      )}
    </div>
  );
}
