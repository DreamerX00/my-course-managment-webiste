"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Shield, User } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = ["ADMIN", "INSTRUCTOR", "OWNER"].includes(userRole);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
          : "bg-white/80 dark:bg-gray-900/80 shadow-md backdrop-blur-md"
      )}
    >
      <div className="w-full max-w-7xl flex h-16 items-center px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="font-extrabold text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 select-none hover:scale-105 transition-transform"
          onClick={closeMobileMenu}
        >
          <Image
            src="/logo.svg"
            alt="Dreamer Academy Logo"
            width={40}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10"
          />
          <span className="hidden sm:inline">Dreamer Academy</span>
          <span className="sm:hidden">DA</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex ml-auto items-center space-x-1 lg:space-x-2">
          <Link
            href="/courses"
            className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50"
          >
            Courses
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 px-3 lg:px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50"
          >
            Leaderboard
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 px-3 lg:px-4 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/50"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/dashboard/admin-dashboard"
                  className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 px-3 lg:px-4 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-1.5"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden lg:inline">Admin Panel</span>
                  <span className="lg:hidden">Admin</span>
                </Link>
              )}
              <NotificationBell />
              <Link
                href="/profile"
                className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 px-3 lg:px-4 py-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/50 flex items-center gap-1.5"
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">Profile</span>
              </Link>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 px-3 lg:px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-sm lg:text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="text-sm lg:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-4 lg:px-6 py-2 rounded-lg"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800"
        >
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/courses"
              className="block text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50"
              onClick={closeMobileMenu}
            >
              Courses
            </Link>
            <Link
              href="/leaderboard"
              className="block text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200 px-4 py-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/50"
              onClick={closeMobileMenu}
            >
              Leaderboard
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 px-4 py-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/50"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/dashboard/admin-dashboard"
                    className="flex text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200 px-4 py-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/50 items-center gap-2"
                    onClick={closeMobileMenu}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 px-4 py-3 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-950/50 items-center gap-2"
                  onClick={closeMobileMenu}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50"
                >
                  <Link href="/login" onClick={closeMobileMenu}>
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-4 py-3 rounded-lg"
                >
                  <Link href="/signup" onClick={closeMobileMenu}>
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
