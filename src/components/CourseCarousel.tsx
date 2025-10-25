"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModernCourseCard } from "./ModernCourseCard"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  category: string
  price: number
  rating: number
  enrolledCount: number
  duration: string
  chaptersCount: number
  thumbnail: string
  isFree: boolean
}

interface CourseCarouselProps {
  courses: Course[]
  title: string
  subtitle: string
}

export function CourseCarousel({ courses, title, subtitle }: CourseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollToNext = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      setCurrentIndex(prev => Math.min(prev + 1, Math.ceil(courses.length / 4) - 1))
    }
  }

  const scrollToPrev = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      setCurrentIndex(prev => Math.max(prev - 1, 0))
    }
  }

  const canScrollNext = currentIndex < Math.ceil(courses.length / 4) - 1
  const canScrollPrev = currentIndex > 0

  return (
    <section className="py-12 sm:py-16 bg-white/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-extrabold tracking-tight text-blue-900 sm:text-4xl"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-2 text-lg leading-8 text-gray-700 font-semibold"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToPrev}
              disabled={!canScrollPrev}
              className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>

          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToNext}
              disabled={!canScrollNext}
              className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {courses.slice(0, 4).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="shrink-0 w-full sm:w-56 lg:w-72"
              >
                <ModernCourseCard course={course} index={index} />
              </motion.div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(courses.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (carouselRef.current) {
                    const scrollAmount = carouselRef.current.offsetWidth * index
                    carouselRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' })
                    setCurrentIndex(index)
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <Button asChild size="lg" variant="outline">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
} 