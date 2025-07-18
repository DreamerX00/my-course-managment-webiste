"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <Navbar />
      {/* <Navbar /> */}
      {children}
      <Toaster />
    </SessionProvider>
  )
} 