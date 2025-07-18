"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  // Placeholder role check; replace with real session.user.role
  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = ["ADMIN", "INSTRUCTOR", "OWNER"].includes(userRole);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-yellow-100 to-pink-100">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="text-7xl mb-4 select-none"
      >
        🏆
      </motion.div>
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
        className="text-4xl font-extrabold text-blue-800 mb-2 animate-bounce"
      >
        Welcome to Your Dashboard!
      </motion.h1>
      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4, type: "spring" }}
        className="text-lg text-pink-700 mb-8 animate-pulse"
      >
        Ready to continue your learning journey? 🚀
      </motion.p>
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95, rotate: -2 }}
      >
        <Link
          href="/courses"
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold text-lg shadow-lg hover:from-pink-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2"
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
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold text-lg shadow-lg hover:from-pink-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-2xl">🛠️</span> Admin Panel
          </Link>
        </motion.div>
      )}
    </div>
  );
} 