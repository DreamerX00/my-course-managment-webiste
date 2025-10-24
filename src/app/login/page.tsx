"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Sparkles, GraduationCap, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const { toast } = useToast()

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCoords({ x, y })
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 px-4 py-12 relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${coords.x}px ${coords.y}px, rgba(59, 130, 246, 0.4) 0%, rgba(236, 72, 153, 0.3) 25%, rgba(251, 191, 36, 0.4) 50%, transparent 70%)`,
        }}
      >
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        />
        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-1/4 left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <GraduationCap className="w-12 h-12 text-blue-600" />
            </motion.div>
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
              LearnHub
            </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 shadow-2xl border-0 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "linear-gradient(90deg, rgba(59,130,246,0.5), rgba(236,72,153,0.5), rgba(251,191,36,0.5))",
                padding: "2px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="h-full w-full bg-white rounded-lg" />
            </motion.div>

            <CardHeader className="space-y-1 text-center relative z-10">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Welcome Back! 👋
              </CardTitle>
              <CardDescription className="text-base">
                Sign in to continue your learning journey
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10">
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-semibold relative overflow-hidden group bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:via-pink-50 hover:to-yellow-50 border-2 hover:border-blue-400 transition-all duration-300"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-pink-400/20 to-yellow-400/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <Chrome className="w-5 h-5 mr-3 relative z-10" />
                    <span className="relative z-10">
                      {isLoading ? "Signing in..." : "Continue with Google"}
                    </span>
                    <ArrowRight className="w-5 h-5 ml-3 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      Quick & Secure
                    </span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2 pt-2"
                >
                  <div className="flex items-center text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                    Instant access to all courses
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 mr-2 text-pink-500" />
                    Track your progress seamlessly
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                    Join our learning community
                  </div>
                </motion.div>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-blue-600 hover:text-pink-600 transition-colors underline underline-offset-4"
                    >
                      Sign up for free
                    </Link>
                  </p>
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1 group"
                  >
                    ← Back to home
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-600 mt-6"
        >
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
