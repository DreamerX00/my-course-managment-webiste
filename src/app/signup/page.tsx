"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { firebaseAuth, googleProvider, signInWithPopup } from "@/lib/firebaseClient"
import { motion } from "framer-motion"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      const idToken = await userCredential.user.getIdToken()
      const result = await signIn("firebase", {
        idToken,
        callbackUrl: "/dashboard",
      })
      if (result?.error) {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        })
        return
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider)
      const idToken = await result.user.getIdToken()
      const signInResult = await signIn("firebase", {
        idToken,
        callbackUrl: "/dashboard",
      })
      if (signInResult?.error) {
        toast({
          title: "Error",
          description: "Google signup failed",
          variant: "destructive",
        })
        return
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Google signup failed",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-200">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="absolute -top-10 left-1/2 -translate-x-1/2 text-7xl select-none"
      >
        🎒
      </motion.div>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
        className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[370px] bg-white/80 rounded-2xl shadow-2xl p-8 border border-yellow-100 backdrop-blur-md"
      >
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-yellow-700 flex items-center justify-center gap-2 animate-bounce">
            Create an Account <span className="text-4xl">📝</span>
          </h1>
          <p className="text-base text-blue-600 font-medium animate-pulse">
            Start your learning adventure! 🌟
          </p>
        </div>
        <div className="grid gap-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-1">
                <label className="text-sm font-bold text-yellow-900" htmlFor="name">
                  Name
                </label>
                <input
                  className="flex h-10 w-full rounded-md border-2 border-yellow-200 bg-white px-3 py-2 text-sm font-medium placeholder:text-yellow-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 transition-all duration-200"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  type="text"
                  autoCapitalize="none"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-bold text-blue-900" htmlFor="email">
                  Email
                </label>
                <input
                  className="flex h-10 w-full rounded-md border-2 border-blue-200 bg-white px-3 py-2 text-sm font-medium placeholder:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 transition-all duration-200"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-bold text-pink-900" htmlFor="password">
                  Password
                </label>
                <input
                  className="flex h-10 w-full rounded-md border-2 border-pink-200 bg-white px-3 py-2 text-sm font-medium placeholder:text-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 transition-all duration-200"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                />
              </div>
              <Button
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-400 to-blue-400 text-white font-bold shadow-lg hover:from-pink-400 hover:to-yellow-400 transition-all duration-200"
              >
                {isLoading ? "Creating account..." : "Create account 🎉"}
              </Button>
            </div>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-blue-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/80 px-2 text-blue-600 font-bold">
                Or continue with
              </span>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95, rotate: -2 }}
          >
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignup}
              className="w-full border-2 border-blue-300 bg-blue-50 text-blue-700 font-bold flex items-center justify-center gap-2 shadow hover:bg-blue-100 transition-all duration-200"
            >
              <span className="text-2xl">🔎</span> Google
            </Button>
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 0.9 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute bottom-0 left-0 w-full flex justify-center pb-4 text-2xl font-bold text-blue-900 drop-shadow"
      >
        <span className="animate-bounce">🌈 Join the Learning Revolution! 🌈</span>
      </motion.div>
    </div>
  )
} 