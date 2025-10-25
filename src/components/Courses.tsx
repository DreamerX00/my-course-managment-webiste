"use client"

import { useEffect, useState } from "react"
import { CourseCarousel } from "./CourseCarousel"

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
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export function Courses() {
  const [loading, setLoading] = useState(true)
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true)
        // Fetch settings and courses in parallel
        const [settingsRes, coursesRes] = await Promise.all([
          fetch("/api/content-settings"),
          fetch("/api/courses")
        ])
        if (!settingsRes.ok || !coursesRes.ok) throw new Error("Failed to fetch data")
        const settings = await settingsRes.json()
        const allCourses = (await coursesRes.json()).filter((c: Course) => c.isPublished)
        // Get featured course IDs from settings
        const featuredIds: string[] = settings.featuredCourses || []
        // Find the featured course objects in the correct order
        const featured = featuredIds
          .map(id => allCourses.find((c: Course) => c.id === id))
          .filter(Boolean) as Course[]
        setFeaturedCourses(featured)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching featured courses:', error)
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  // Show loading state or empty state if no courses
  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-white/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-900 sm:text-4xl">
              Our Popular Courses
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-700 font-semibold">
              Explore our top-rated courses and start your learning journey today.
            </p>
          </div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </section>
    )
  }

  if (featuredCourses.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-white/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-blue-900 sm:text-4xl">
              Our Popular Courses
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-700 font-semibold">
              Explore our top-rated courses and start your learning journey today.
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">No featured courses selected by admin.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <CourseCarousel
      courses={featuredCourses}
      title="Our Popular Courses"
      subtitle="Explore our top-rated courses and start your learning journey today."
    />
  )
} 