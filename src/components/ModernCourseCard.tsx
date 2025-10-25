"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Clock, User, Play } from "lucide-react"

interface ModernCourseCardProps {
  course: {
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
  index: number
}

export function ModernCourseCard({ course, index }: ModernCourseCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Web Development": "bg-blue-100 text-blue-800",
      "Mobile Development": "bg-purple-100 text-purple-800",
      "Data Science": "bg-green-100 text-green-800",
      "AI/ML": "bg-orange-100 text-orange-800",
      "DevOps": "bg-red-100 text-red-800",
      "Design": "bg-pink-100 text-pink-800",
      "Business": "bg-indigo-100 text-indigo-800",
      "Marketing": "bg-teal-100 text-teal-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -3, scale: 1.02 }}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        {/* Course Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Price Badge */}
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className={`${
                course.isFree
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              } font-semibold text-xs px-2 py-1`}
            >
              {course.isFree ? "Free" : `₹${course.price}`}
            </Badge>
          </div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
              <Play className="h-4 w-4 text-gray-800 fill-current" />
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category Badge */}
          <div className="mb-2">
            <Badge
              variant="secondary"
              className={`${getCategoryColor(course.category)} text-xs font-medium px-2 py-1`}
            >
              {course.category}
            </Badge>
          </div>

          {/* Course Title */}
          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-1 mb-2 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span>{course.instructor}</span>
          </div>

          {/* Rating and Enrolled */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              {renderStars(course.rating)}
              <span className="text-xs font-medium text-gray-700 ml-1">
                {course.rating}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({course.enrolledCount.toLocaleString()})
            </span>
          </div>

          {/* Course Stats */}
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{course.duration}</span>
            </div>
            <span>•</span>
            <span>{course.chaptersCount} chapters</span>
          </div>

          {/* View Course Button */}
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2">
            <Link href={`/courses/${course.id}`}>
              View Course
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
} 