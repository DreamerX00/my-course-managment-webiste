"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HERO_CONTENT } from "@/lib/constants"
import { useState } from "react"

export function Hero() {
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCoords({ x, y })
  }

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-gradient-to-br from-blue-200 via-pink-100 to-yellow-100 py-16 sm:py-24 lg:py-32 min-h-[calc(100vh-80px)] flex items-center"
    >
      {/* Animated Background with Mouse Response */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${coords.x}px ${coords.y}px, rgba(59, 130, 246, 0.4) 0%, rgba(236, 72, 153, 0.3) 25%, rgba(251, 191, 36, 0.4) 50%, transparent 70%)`,
        }}
      >
        {/* Floating Animated Blobs */}
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-blue-900 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 drop-shadow-lg"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          <motion.span
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            🎓
          </motion.span>
          <span className="leading-tight bg-gradient-to-r from-blue-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
            {HERO_CONTENT.title.replace('👨‍💻✨', '')}
          </span>
          <motion.span
            whileHover={{ rotate: -10, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            📚
          </motion.span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-pink-700 max-w-3xl mx-auto font-bold px-4 drop-shadow-md"
          whileHover={{
            scale: 1.01,
            transition: { duration: 0.3 }
          }}
        >
          {HERO_CONTENT.subtitle.replace('🚀', '')} <span className="inline-block">🚀</span>
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              asChild 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold shadow-lg hover:from-pink-400 hover:to-blue-400 transition-all duration-300 flex items-center gap-2 text-base sm:text-lg relative overflow-hidden group"
            >
              <Link href="/courses">
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)` }}
                />
                <span className="relative z-10">
                  {HERO_CONTENT.cta1} 
                  <span className="text-xl sm:text-2xl ml-2">✨</span>
                </span>
              </Link>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-blue-900 border-blue-900 hover:bg-blue-100/40 transition-all duration-300 shadow-lg font-bold flex items-center gap-2 text-base sm:text-lg relative overflow-hidden group"
            >
              <Link href="/community">
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10">
                  {HERO_CONTENT.cta2} 
                  <span className="text-xl sm:text-2xl ml-2">🌈</span>
                </span>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8 sm:mt-12 text-lg sm:text-xl md:text-2xl font-bold text-blue-900 drop-shadow-lg px-4"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          <motion.span
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="bg-gradient-to-r from-blue-900 via-purple-800 to-pink-800 bg-clip-text text-transparent bg-[length:200%_200%]"
          >
            Empowering Education for Everyone!
          </motion.span>
          <span className="inline-block ml-2">🌟</span>
        </motion.div>
      </div>
    </section>
  )
} 