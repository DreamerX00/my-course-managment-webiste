"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { BookOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    tags: string[]
    topicCount: number
    resourcesAvailable: boolean
    imageUrl: string
  }
  index: number
}

export function CourseCard({ course, index }: CourseCardProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = async () => {
      try {
        // Get saved progress from localStorage
        const savedProgress = localStorage.getItem(`progress_${course.id}`);
        if (!savedProgress) {
          setProgress(0);
          return;
        }

        const completedItems = JSON.parse(savedProgress);
        
        // Fetch course structure to get total items count
        const response = await fetch(`/api/courses/${course.id}`);
        if (response.ok) {
          const courseData = await response.json();
          
          // Calculate total items (chapters + subchapters)
          const totalItems = courseData.chapters.reduce((total: number, chapter: { subchapters?: unknown[] }) => {
            return total + 1 + (chapter.subchapters?.length || 0); // +1 for the chapter itself
          }, 0);
          
          const calculatedProgress = (completedItems.length / totalItems) * 100;
          setProgress(Math.min(calculatedProgress, 100));
        } else {
          // Fallback to simple calculation if API fails
          const totalItems = 10;
          const calculatedProgress = (completedItems.length / totalItems) * 100;
          setProgress(Math.min(calculatedProgress, 100));
        }
      } catch (error) {
        console.error('Error calculating progress:', error);
        setProgress(0);
      }
    };

    calculateProgress();
  }, [course.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{
        scale: 1.03,
        boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.15)",
        y: -3,
      }}
      className={cn(
        "relative flex flex-col rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 bg-card text-card-foreground transform transition-all duration-300 ease-in-out",
        "hover:border-primary dark:hover:border-primary-foreground"
      )}
    >
      {/* Course Image */}
      <div className="aspect-video relative overflow-hidden">
        <Image
          src={course.imageUrl}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {course.tags.includes("Popular") && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-yellow-900 text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
            🔥 Popular
          </span>
        )}
        {course.tags.includes("New") && (
          <span className="absolute top-2 left-2 bg-green-500 text-green-900 text-xs font-semibold px-2 py-0.5 rounded-full shadow-md">
            ✨ New
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col grow">
        {/* Title and Description */}
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {course.tags.map((tag, i) => (
            <span
              key={i}
              className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Topics and Resources */}
        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center">
            <BookOpen className="h-3 w-3 mr-1 text-primary" />
            <span>{course.topicCount} Topics</span>
          </div>
          <div className="flex items-center">
            <Download
              className={cn(
                "h-3 w-3 mr-1",
                course.resourcesAvailable ? "text-primary" : "text-gray-400"
              )}
            />
            <span
              className={cn(
                course.resourcesAvailable ? "text-foreground" : "text-gray-400"
              )}
            >
              Resources
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mb-3">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Progress: {Math.round(progress)}%
        </p>

        {/* Start Course Button */}
        <Button asChild className="w-full text-xs py-2">
          <Link href={`/courses/${course.id}/start`}>
            {progress > 0 ? "Continue Learning" : "Start Learning"}
          </Link>
        </Button>
      </div>
    </motion.div>
  );
} 