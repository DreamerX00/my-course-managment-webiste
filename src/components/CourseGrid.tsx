"use client"

import { ModernCourseCard } from "./ModernCourseCard"
import { motion } from "framer-motion"
import { BookOpen, Search } from "lucide-react"

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

interface CourseGridProps {
  courses: Course[]
  loading: boolean
  error: string | null
  gridColumns?: number
}

export function CourseGrid({ courses, loading, error, gridColumns = 3 }: CourseGridProps) {
  const gridClass =
    gridColumns === 2
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"
      : gridColumns === 4
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-4`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-8 bg-gray-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="text-red-500 mb-4">
          <Search className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Courses</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </motion.div>
    )
  }

  if (courses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="text-gray-500 mb-4">
          <BookOpen className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {courses.map((course, index) => (
        <ModernCourseCard key={course.id} course={course} index={index} />
      ))}
    </div>
  )
} 