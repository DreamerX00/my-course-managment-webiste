"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

interface Course {
  id: string
  title: string
  progress: number
  lastAccessed: string
}

interface Profile {
  name: string
  email: string
  image: string
  role: string
  courses: Course[]
  totalScore: number
  completedCourses: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { status } = useSession()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await response.json()
        setProfile(data)
      } catch {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Profile not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Image
                src={profile.image}
                alt={profile.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.email}</p>
                <p className="text-sm font-medium mt-1">
                  {profile.role.charAt(0) + profile.role.slice(1).toLowerCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{profile.totalScore.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-2xl font-bold">{profile.completedCourses}</div>
                <div className="text-sm text-muted-foreground">Courses Completed</div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/profile/edit")}
            >
              Edit Profile
            </Button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            <div className="space-y-4">
              {profile.courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/courses/${course.id}/learn`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{course.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 