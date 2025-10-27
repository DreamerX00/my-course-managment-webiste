"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Shield, User } from "lucide-react";

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
          ? "bg-white/90 shadow-lg backdrop-blur-md"
          : "bg-white/70 shadow-sm backdrop-blur-md"
      )}
      style={{ borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}
    >
      <div className="w-full max-w-7xl flex h-16 items-center px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="font-extrabold text-lg sm:text-xl lg:text-2xl text-blue-800 flex items-center gap-2 select-none"
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
        <div className="hidden md:flex ml-auto items-center space-x-2 lg:space-x-4">
          <Link
            href="/courses"
            className="text-sm lg:text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-2 lg:px-3 py-1 rounded-md hover:bg-blue-50"
          >
            Courses
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm lg:text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-2 lg:px-3 py-1 rounded-md hover:bg-blue-50"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/dashboard/admin-dashboard"
                  className="text-sm lg:text-base font-semibold text-purple-700 hover:text-purple-500 transition-colors duration-200 px-2 lg:px-3 py-1 rounded-md hover:bg-purple-50 flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <Link
                href="/profile"
                className="text-sm lg:text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-2 lg:px-3 py-1 rounded-md hover:bg-blue-50 flex items-center gap-1"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-sm lg:text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-2 lg:px-3 py-1 rounded-md hover:bg-blue-50"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-sm lg:text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-2 lg:px-3 py-1 rounded-md hover:bg-blue-50"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="text-sm lg:text-base font-semibold text-white bg-pink-500 hover:bg-pink-600 shadow-md px-3 lg:px-4 py-1 rounded-md"
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
            className="text-blue-700 hover:text-pink-500 hover:bg-blue-50"
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
          className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/courses"
              className="block text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-50"
              onClick={closeMobileMenu}
            >
              Courses
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-50"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    href="/dashboard/admin-dashboard"
                    className="flex text-base font-semibold text-purple-700 hover:text-purple-500 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-purple-50 items-center gap-2"
                    onClick={closeMobileMenu}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-50 items-center gap-2"
                  onClick={closeMobileMenu}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start text-base font-semibold text-blue-700 hover:text-pink-500 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-50"
                >
                  <Link href="/login" onClick={closeMobileMenu}>
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start text-base font-semibold text-white bg-pink-500 hover:bg-pink-600 shadow-md px-3 py-2 rounded-md"
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
