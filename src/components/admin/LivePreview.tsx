"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Filter, 
  ArrowUpDown, 
  TrendingUp,
  Clock,
  Star,
  Users,
  BookOpen
} from "lucide-react"

interface ContentSettings {
  filterCategories: Array<{
    id: string
    name: string
    color: string
    order: number
  }>
  featuredCourses: string[]
  layoutOptions: {
    gridColumns: number
    showFiltersSidebar: boolean
    showSortingDropdown: boolean
    showTrendingSection: boolean
    showRecentlyAdded: boolean
  }
}

interface Course {
  id: string
  title: string
  instructor: string
  rating: number
  enrolledCount: number
  price: number
  thumbnail: string
  duration: string
}

interface LivePreviewProps {
  settings: ContentSettings
}

export function LivePreview({ settings }: LivePreviewProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const gridColsClass = settings.layoutOptions.gridColumns === 2 ? 'grid-cols-2' : 
                       settings.layoutOptions.gridColumns === 3 ? 'grid-cols-3' : 'grid-cols-4'

  const featuredCourseObjects = courses.filter(course => 
    settings.featuredCourses.includes(course.id)
  )

  const displayCourses = courses.slice(0, 6) // Show first 6 courses for preview

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <p className="text-sm text-gray-600">
            Preview how the explore page will look with your current settings.
          </p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg bg-white overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Explore Courses</h2>
                <div className="flex items-center gap-2">
                  {settings.layoutOptions.showSortingDropdown && (
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort by
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar */}
              {settings.layoutOptions.showFiltersSidebar && (
                <div className="w-64 border-r bg-gray-50 p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {settings.filterCategories.slice(0, 5).map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Price</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700">Free</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700">Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 p-4">
                {/* Featured Courses Section */}
                {featuredCourseObjects.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold text-gray-900">Featured Courses</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {featuredCourseObjects.map((course) => (
                        <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-gradient-to-br from-yellow-50 to-orange-50">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">{course.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">by {course.instructor}</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{course.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{course.enrolledCount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Section */}
                {settings.layoutOptions.showTrendingSection && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-900">Trending Courses</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {displayCourses.slice(0, 3).map((course) => (
                        <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">{course.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">by {course.instructor}</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{course.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{course.enrolledCount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Added Section */}
                {settings.layoutOptions.showRecentlyAdded && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-gray-900">Recently Added</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {displayCourses.slice(3, 6).map((course) => (
                        <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">{course.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">by {course.instructor}</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{course.rating}</span>
                              </div>
                              <span className="text-green-600 font-medium">₹{course.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Course Grid */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">All Courses</h3>
                  {loading ? (
                    <div className="grid gap-4 animate-pulse">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border rounded-lg overflow-hidden">
                          <div className="w-full h-32 bg-gray-200"></div>
                          <div className="p-3 space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`grid gap-4 ${gridColsClass}`}>
                      {displayCourses.map((course) => (
                        <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">{course.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">by {course.instructor}</p>
                            <div className="flex items-center justify-between text-xs mb-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{course.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{course.enrolledCount.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-green-600 font-medium">₹{course.price}</span>
                              <Badge variant="secondary" className="text-xs">
                                <BookOpen className="h-3 w-3 mr-1" />
                                View
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Preview Information:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Grid Layout: {settings.layoutOptions.gridColumns} columns</li>
              <li>• Filters Sidebar: {settings.layoutOptions.showFiltersSidebar ? 'Visible' : 'Hidden'}</li>
              <li>• Sorting Options: {settings.layoutOptions.showSortingDropdown ? 'Available' : 'Hidden'}</li>
              <li>• Trending Section: {settings.layoutOptions.showTrendingSection ? 'Visible' : 'Hidden'}</li>
              <li>• Recently Added: {settings.layoutOptions.showRecentlyAdded ? 'Visible' : 'Hidden'}</li>
              <li>• Categories: {settings.filterCategories.length} available</li>
              <li>• Featured Courses: {settings.featuredCourses.length}/4 selected</li>
              <li>• Real Courses Loaded: {courses.length} courses from database</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 