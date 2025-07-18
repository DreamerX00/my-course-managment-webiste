"use client"

import { motion } from "framer-motion"
import { WHY_CHOOSE_US } from "@/lib/constants"

export function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Why Choose Dreamer Academy?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-2 text-lg leading-8 text-muted-foreground"
          >
            We are dedicated to providing the best learning experience.
          </motion.p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl sm:mt-16 lg:mt-20 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3">
            {WHY_CHOOSE_US.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm p-6"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  {item.text}
                </dt>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
} 