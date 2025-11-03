import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { Difficulty } from "@prisma/client";

interface BulkAssignment {
  courseId: string;
  totalPoints: number;
  difficulty: Difficulty;
}

/**
 * Bulk assign points to multiple courses
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
    const { assignments } = body as { assignments: BulkAssignment[] };

    if (
      !assignments ||
      !Array.isArray(assignments) ||
      assignments.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing or invalid assignments array" },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      errors: [] as { courseId: string; error: string }[],
    };

    // Process each assignment
    for (const assignment of assignments) {
      try {
        const { courseId, totalPoints, difficulty } = assignment;

        // Validate
        if (!courseId || !totalPoints || !difficulty) {
          results.errors.push({
            courseId: courseId || "unknown",
            error: "Missing required fields",
          });
          continue;
        }

        if (totalPoints < 100 || totalPoints > 50000) {
          results.errors.push({
            courseId,
            error: "Total points must be between 100 and 50,000",
          });
          continue;
        }

        // Get course and count chapters
        const course = await db.course.findUnique({
          where: { id: courseId },
          include: {
            chapters: { select: { id: true } },
          },
        });

        if (!course) {
          results.errors.push({
            courseId,
            error: "Course not found",
          });
          continue;
        }

        if (course.chapters.length === 0) {
          results.errors.push({
            courseId,
            error: "Course has no chapters",
          });
          continue;
        }

        // Calculate points per chapter
        const pointsPerChapter = totalPoints / course.chapters.length;

        // Upsert course points
        await db.coursePoints.upsert({
          where: { courseId },
          create: {
            courseId,
            totalPoints,
            pointsPerChapter,
            difficulty,
            assignedBy: user.id,
          },
          update: {
            totalPoints,
            pointsPerChapter,
            difficulty,
            assignedBy: user.id,
          },
        });

        results.success.push(courseId);
      } catch (error) {
        results.errors.push({
          courseId: assignment.courseId,
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${assignments.length} assignments`,
      results: {
        successCount: results.success.length,
        errorCount: results.errors.length,
        success: results.success,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error("Error in bulk assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
