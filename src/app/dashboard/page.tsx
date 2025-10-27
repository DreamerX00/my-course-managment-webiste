"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import Image from "next/image";

export default function DashboardPage() {
  const { data: session } = useSession();
  // Placeholder role check; replace with real session.user.role
  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = ["ADMIN", "INSTRUCTOR", "OWNER"].includes(userRole);

  // Demo stats (replace with real data)
  const stats = useMemo(
    () => [
      { label: "Courses Enrolled", value: 7, icon: "📚" },
      { label: "Courses Completed", value: 3, icon: "✅" },
      { label: "Badges Earned", value: 5, icon: "🏅" },
    ],
    []
  );

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
        className="dashboard-stat-card dashboard-stat-card-animate"
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
        {stats.map((stat, idx) => (
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
