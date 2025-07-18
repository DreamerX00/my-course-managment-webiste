"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface LeaderboardEntry {
  id: string
  name: string
  image: string
  totalScore: number
  completedCourses: number
  rank: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard")
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard")
        }
        const data = await response.json()
        setLeaderboard(data)
      } catch (error) {
        console.error("Failed to load leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="mt-2 text-muted-foreground">
            Top performers in our courses
          </p>
        </div>

        <div className="rounded-lg border">
          <div className="grid grid-cols-4 p-4 font-semibold border-b">
            <div>Rank</div>
            <div>Student</div>
            <div>Total Score</div>
            <div>Courses Completed</div>
          </div>

          <div className="divide-y">
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`grid grid-cols-4 p-4 ${
                  entry.id === session?.user?.id
                    ? "bg-primary/5"
                    : ""
                }`}
              >
                <div className="font-medium">#{entry.rank}</div>
                <div className="flex items-center gap-3">
                  <img
                    src={entry.image}
                    alt={entry.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{entry.name}</span>
                </div>
                <div>{entry.totalScore.toFixed(1)}%</div>
                <div>{entry.completedCourses}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 