"use client"

import { motion } from "framer-motion"
import { NEWSLETTER_CONTENT } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Newsletter() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-500 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          {NEWSLETTER_CONTENT.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4 text-lg leading-8 text-white max-w-2xl mx-auto"
        >
          {NEWSLETTER_CONTENT.subtitle}
        </motion.p>
        <motion.form
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-4 max-w-lg mx-auto"
        >
          <Input
            type="email"
            placeholder={NEWSLETTER_CONTENT.placeholder}
            className="flex-grow min-w-0 bg-white/20 border-white text-white placeholder:text-white/70 focus:ring-2 focus:ring-white focus:border-white"
          />
          <Button
            type="submit"
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 transition-colors duration-300 shadow-lg"
          >
            {NEWSLETTER_CONTENT.buttonText}
          </Button>
        </motion.form>
      </div>
    </section>
  )
} 