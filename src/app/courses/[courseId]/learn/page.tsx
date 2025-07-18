"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Chapter {
  id: string
  title: string
  description: string
  videoUrl: string
  isFree: boolean
}

interface Course {
  id: string
  title: string
  description: string
  chapters: Chapter[]
}

export default function CourseLearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { courseId } = use(params);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch course")
        }
        const data = await response.json()
        setCourse(data)
        if (data.chapters.length > 0) {
          setCurrentChapter(data.chapters[0])
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load course",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, toast])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Course not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
            {currentChapter?.videoUrl ? (
              <video
                src={currentChapter.videoUrl}
                controls
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                No video available
              </div>
            )}
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{currentChapter?.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {currentChapter?.description}
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <div className="space-y-4">
            {course.chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setCurrentChapter(chapter)}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${
                  currentChapter?.id === chapter.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div>
                  <h3 className="font-medium">{chapter.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {chapter.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 