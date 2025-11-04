import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

/**
 * Recalculate points distribution for a course
 * This should be called whenever chapters/subchapters are added, removed, or modified
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing required field: courseId" },
        { status: 400 }
      );
    }

    // Get course with chapters and subchapters
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            subchapters: {
              select: {
                id: true,
              },
            },
          },
        },
        coursePoints: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.coursePoints) {
      return NextResponse.json(
        {
          success: false,
          message: "No points configuration found for this course",
        },
        { status: 200 }
      );
    }

    // Calculate total items (chapters + subchapters)
    const chapterCount = course.chapters.length;
    const subchapterCount = course.chapters.reduce(
      (sum, chapter) => sum + chapter.subchapters.length,
      0
    );
    const totalItems = chapterCount + subchapterCount;

    if (totalItems === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Course must have at least one chapter or subchapter",
        },
        { status: 400 }
      );
    }

    // Recalculate points per item
    const newPointsPerChapter = course.coursePoints.totalPoints / totalItems;

    // Update course points
    const updatedCoursePoints = await db.coursePoints.update({
      where: { courseId },
      data: {
        pointsPerChapter: newPointsPerChapter,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Points recalculated successfully",
      data: {
        totalPoints: updatedCoursePoints.totalPoints,
        previousPointsPerItem: course.coursePoints.pointsPerChapter,
        newPointsPerItem: newPointsPerChapter,
        chapterCount,
        subchapterCount,
        totalItems,
      },
    });
  } catch (error) {
    console.error("Error recalculating points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
