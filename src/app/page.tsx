"use client"

import { Hero } from "@/components/Hero"
import { Features } from "@/components/Features"
import { Courses } from "@/components/Courses"
import { WhyChooseUs } from "@/components/WhyChooseUs"
import { Newsletter } from "@/components/Newsletter"
import { Footer } from "@/components/Footer"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-pink-50 to-yellow-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col flex-1"
      >
      <Hero />
      <Features />
      <Courses />
      <WhyChooseUs />
      <Newsletter />
      <Footer />
      </motion.div>
    </div>
  )
}
