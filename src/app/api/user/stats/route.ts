import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

/**
 * GET /api/user/stats
 * Fetch the current user's dashboard statistics
 * - Number of courses enrolled
 * - Number of courses completed
 * - Number of badges earned
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get enrolled courses count
    const enrolledCount = await db.course.count({
      where: {
        students: {
          some: { id: userId },
        },
      },
    });

    // Get all progress records for the user
    const userProgress = await db.progress.findMany({
      where: {
        userId: userId,
        isCompleted: true,
      },
      include: {
        course: {
          include: {
            chapters: {
              select: { id: true },
            },
          },
        },
      },
    });

    // Group progress by course and count completed courses
    const courseProgressMap = new Map<string, number>();
    const courseTotalChaptersMap = new Map<string, number>();

    for (const progress of userProgress) {
      const courseId = progress.courseId;
      courseProgressMap.set(
        courseId,
        (courseProgressMap.get(courseId) || 0) + 1
      );

      if (!courseTotalChaptersMap.has(courseId)) {
        courseTotalChaptersMap.set(courseId, progress.course.chapters.length);
      }
    }

    // Count courses where all chapters are completed
    let completedCount = 0;
    for (const [courseId, completedChapters] of courseProgressMap) {
      const totalChapters = courseTotalChaptersMap.get(courseId) || 0;
      if (totalChapters > 0 && completedChapters >= totalChapters) {
        completedCount++;
      }
    }

    // Calculate badges based on achievements:
    // - 1 badge for every course completed
    // - 1 bonus badge for enrolling in 5+ courses
    // - 1 bonus badge for completing 3+ courses
    let badgesEarned = completedCount;

    if (enrolledCount >= 5) {
      badgesEarned += 1;
    }

    if (completedCount >= 3) {
      badgesEarned += 1;
    }

    return NextResponse.json({
      enrolledCount,
      completedCount,
      badgesEarned,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
