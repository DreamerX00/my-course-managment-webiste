import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role
    const isAdmin = ["ADMIN", "INSTRUCTOR", "OWNER"].includes(userRole)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch statistics from database
    const [
      totalCourses,
      totalStudents,
      totalInstructors,
      totalProgress,
      completedProgress
    ] = await Promise.all([
      // Total courses
      db.course.count(),
      
      // Total students (users with STUDENT role)
      db.user.count({
        where: { role: "STUDENT" }
      }),
      
      // Total instructors (users with INSTRUCTOR role)
      db.user.count({
        where: { role: "INSTRUCTOR" }
      }),
      
      // Total progress entries
      db.progress.count(),
      
      // Completed progress entries
      db.progress.count({
        where: { isCompleted: true }
      })
    ])

    // Calculate completion rate
    const completionRate = totalProgress > 0 
      ? Math.round((completedProgress / totalProgress) * 100)
      : 0

    const stats = {
      totalCourses,
      totalStudents,
      totalInstructors,
      completionRate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' }, 
      { status: 500 }
    )
  }
} 