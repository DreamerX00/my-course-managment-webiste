import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { Difficulty } from "@prisma/client";

/**
 * Get all courses with their point configurations
 */
export async function GET() {
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

    // Get all courses with chapters and points configuration
    const courses = await db.course.findMany({
      include: {
        chapters: {
          select: {
            id: true,
            subchapters: {
              select: {
                id: true,
              },
            },
          },
        },
        coursePoints: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response
    const formattedCourses = courses.map((course) => {
      // Count total items (chapters + subchapters)
      const chapterCount = course.chapters.length;
      const subchapterCount = course.chapters.reduce(
        (sum, chapter) => sum + chapter.subchapters.length,
        0
      );
      const totalItems = chapterCount + subchapterCount;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        isPublished: course.isPublished,
        chapterCount,
        subchapterCount,
        totalItems,
        pointsConfiguration: course.coursePoints
          ? {
              totalPoints: course.coursePoints.totalPoints,
              pointsPerChapter: course.coursePoints.pointsPerChapter,
              difficulty: course.coursePoints.difficulty,
              assignedBy: course.coursePoints.assignedBy,
              assignedAt: course.coursePoints.assignedAt,
              updatedAt: course.coursePoints.updatedAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      courses: formattedCourses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Assign or update points for a course
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
    const { courseId, totalPoints, difficulty, adminNotes } = body;

    // Validate inputs
    if (!courseId || !totalPoints || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, totalPoints, difficulty" },
        { status: 400 }
      );
    }

    if (totalPoints < 100 || totalPoints > 50000) {
      return NextResponse.json(
        { error: "Total points must be between 100 and 50,000" },
        { status: 400 }
      );
    }

    const validDifficulties: Difficulty[] = [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "EXPERT",
    ];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        {
          error:
            "Invalid difficulty. Must be BEGINNER, INTERMEDIATE, ADVANCED, or EXPERT",
        },
        { status: 400 }
      );
    }

    // Get course and count chapters + subchapters
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          select: {
            id: true,
            subchapters: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
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
        { error: "Course must have at least one chapter or subchapter" },
        { status: 400 }
      );
    }

    // Calculate points per item (distributed equally among all chapters and subchapters)
    const pointsPerChapter = totalPoints / totalItems;

    // Create or update course points
    const coursePoints = await db.coursePoints.upsert({
      where: { courseId },
      create: {
        courseId,
        totalPoints,
        pointsPerChapter,
        difficulty,
        assignedBy: user.id,
        adminNotes: adminNotes || null,
      },
      update: {
        totalPoints,
        pointsPerChapter,
        difficulty,
        assignedBy: user.id,
        adminNotes: adminNotes || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Course points updated successfully",
      coursePoints: {
        ...coursePoints,
        chapterCount,
        subchapterCount,
        totalItems,
      },
    });
  } catch (error) {
    console.error("Error updating course points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Delete points configuration for a course
 */
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing courseId parameter" },
        { status: 400 }
      );
    }

    await db.coursePoints.delete({
      where: { courseId },
    });

    return NextResponse.json({
      success: true,
      message: "Course points configuration deleted",
    });
  } catch (error) {
    console.error("Error deleting course points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
