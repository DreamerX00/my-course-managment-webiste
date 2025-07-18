"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { SearchBar } from "@/components/SearchBar"
import { FilterBar } from "@/components/FilterBar"
import { CourseGrid } from "@/components/CourseGrid"
import { ModernCourseCard } from "@/components/ModernCourseCard"

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Content settings state
  const [contentSettings, setContentSettings] = useState<any>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriceType, setSelectedPriceType] = useState("all")
  const [selectedSort, setSelectedSort] = useState("newest")

  // Check if filtering by a specific category
  const isFilteringByCategory = selectedCategory !== "all"

  // Fetch content settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true)
        const response = await fetch("/api/content-settings")
        if (!response.ok) throw new Error("Failed to fetch settings")
        const data = await response.json()
        setContentSettings(data)
      } catch (err) {
        setContentSettings(null)
        console.error("Error fetching content settings:", err)
      } finally {
        setSettingsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/courses")
        if (!response.ok) {
          throw new Error('Failed to fetch courses')
        }
        const data = await response.json()
        setCourses(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load courses")
        setLoading(false)
        console.error('Error fetching courses:', err)
      }
    }
    fetchCourses()
  }, [])

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      // Search filter
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter - check for exact match or "all"
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory

      // Price filter
      const matchesPrice = selectedPriceType === "all" || 
                          (selectedPriceType === "free" && course.isFree) ||
                          (selectedPriceType === "paid" && !course.isFree)

      return matchesSearch && matchesCategory && matchesPrice
    })

    // Sort courses
    switch (selectedSort) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "popular":
        filtered.sort((a, b) => b.enrolledCount - a.enrolledCount)
        break
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "duration":
        filtered.sort((a, b) => {
          const aHours = parseInt(a.duration.split(' ')[0])
          const bHours = parseInt(b.duration.split(' ')[0])
          return aHours - bHours
        })
        break
      default:
        break
    }

    return filtered
  }, [courses, searchQuery, selectedCategory, selectedPriceType, selectedSort])

  // Dynamic categories from settings
  const dynamicCategories = contentSettings?.filterCategories?.map((cat: any) => cat.name) || []
  const showFiltersSidebar = contentSettings?.layoutOptions?.showFiltersSidebar !== false
  const showSortingDropdown = contentSettings?.layoutOptions?.showSortingDropdown !== false
  const gridColumns = contentSettings?.layoutOptions?.gridColumns || 3
  const showTrendingSection = contentSettings?.layoutOptions?.showTrendingSection !== false
  const showRecentlyAdded = contentSettings?.layoutOptions?.showRecentlyAdded !== false

  // Get trending courses (most enrolled)
  const trendingCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => b.enrolledCount - a.enrolledCount)
      .slice(0, 6)
  }, [courses])

  // Get recently added courses
  const recentlyAddedCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  }, [courses])

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
            Explore All Courses
          </h1>
          <p className="text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Dive into a wide range of programming and tech courses designed to help
            you master new skills and advance your career.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 space-y-6"
        >
          <SearchBar onSearch={setSearchQuery} className="max-w-md mx-auto" />
          <FilterBar
            categories={dynamicCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedPriceType={selectedPriceType}
            onPriceTypeChange={setSelectedPriceType}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            showSidebar={showFiltersSidebar}
            showSorting={showSortingDropdown}
            loading={settingsLoading}
            colorMap={contentSettings?.filterCategories?.reduce((acc: any, cat: any) => { acc[cat.name] = cat.color; return acc }, {})}
          />
        </motion.div>

        {/* Trending Section - only show when not filtering by category */}
        {!isFilteringByCategory && showTrendingSection && trendingCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Courses</h2>
              <p className="text-gray-600">Most popular courses based on enrollment</p>
            </div>
            <div className={`grid gap-6 ${gridColumns === 2 ? 'grid-cols-1 md:grid-cols-2' : gridColumns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {trendingCourses.slice(0, gridColumns * 2).map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <ModernCourseCard course={course} index={index} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recently Added Section - only show when not filtering by category */}
        {!isFilteringByCategory && showRecentlyAdded && recentlyAddedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recently Added</h2>
              <p className="text-gray-600">Latest courses added to our platform</p>
            </div>
            <div className={`grid gap-6 ${gridColumns === 2 ? 'grid-cols-1 md:grid-cols-2' : gridColumns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {recentlyAddedCourses.slice(0, gridColumns * 2).map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <ModernCourseCard course={course} index={index} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedCourses.length} of {courses.length} courses
            </p>
          </motion.div>
        )}

        {/* Course Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <CourseGrid
            courses={filteredAndSortedCourses}
            loading={loading}
            error={error}
            gridColumns={gridColumns}
          />
        </motion.div>
      </div>
    </div>
  )
} 