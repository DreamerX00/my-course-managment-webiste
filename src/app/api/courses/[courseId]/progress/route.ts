/**
 * @fileoverview Progress Tracking API Route
 * @description Manages user progress through course content
 *
 * Features:
 * - GET: Fetch user's progress for a specific course
 * - POST: Update progress (mark chapter/subchapter as complete)
 * - Calculates completion percentage
 * - Tracks individual chapter/subchapter completion
 *
 * @route GET /api/courses/[courseId]/progress - Get user progress
 * @route POST /api/courses/[courseId]/progress - Update progress
 *
 * TODO: Add progress milestones (25%, 50%, 75%, 100%)
 * TODO: Add badges for completion milestones
 * TODO: Add time tracking (minutes spent per chapter)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = "force-dynamic";

/**
 * GET /api/courses/[courseId]/progress
 *
 * Retrieves user's progress for the specified course.
 * - Fetches all completed chapters/subchapters
 * - Calculates total items (chapters + subchapters)
 * - Returns completion percentage
 *
 * @param request - Next.js request object
 * @param context - Route context with courseId param
 * @returns JSON response with progress data
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;

  try {
    // Step 1: Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to view progress." },
        { status: 401 }
      );
    }

    // Step 2: Validate course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            subchapters: {
              select: { id: true },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Step 3: Get all progress records for this user and course
    const progressRecords = await db.progress.findMany({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
      select: {
        chapterId: true,
        isCompleted: true,
        updatedAt: true,
      },
    });

    // Step 4: Calculate total items (chapters + subchapters)
    let totalItems = 0;
    const chapterProgress: Record<
      string,
      { completed: boolean; subchaptersCount: number }
    > = {};

    for (const chapter of course.chapters) {
      totalItems += 1; // Count the chapter itself
      totalItems += chapter.subchapters.length; // Count all subchapters

      chapterProgress[chapter.id] = {
        completed: false,
        subchaptersCount: chapter.subchapters.length,
      };
    }

    // Step 5: Map completed items
    const completedChapterIds = progressRecords
      .filter((p) => p.isCompleted)
      .map((p) => p.chapterId);

    // Update chapter progress tracking
    for (const chapterId of completedChapterIds) {
      if (chapterProgress[chapterId]) {
        chapterProgress[chapterId].completed = true;
      }
    }

    // Step 6: Calculate progress percentage
    const completedCount = completedChapterIds.length;
    const progressPercentage =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Step 7: Determine course completion status
    const isCompleted = progressPercentage === 100;
    const lastActivity =
      progressRecords.length > 0
        ? progressRecords.reduce((latest, record) => {
            const latestTime = latest.getTime();
            const recordTime = record.updatedAt.getTime();
            return recordTime > latestTime ? record.updatedAt : latest;
          }, progressRecords[0].updatedAt)
        : null;

    return NextResponse.json({
      courseId,
      userId: session.user.id,
      completedChapters: completedChapterIds,
      completedCount,
      totalCount: totalItems,
      progressPercentage,
      isCompleted,
      lastActivity,
      chapterDetails: chapterProgress,
    });
  } catch (error) {
    console.error("Progress fetch error:", error);

    return NextResponse.json(
      { error: "Failed to fetch progress. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[courseId]/progress
 *
 * Updates user's progress for a chapter/subchapter.
 * - Marks item as complete or incomplete
 * - Uses upsert to handle new and existing records
 * - Validates chapter belongs to course
 *
 * @param request - Next.js request object
 * @param context - Route context with courseId param
 * @returns JSON response with updated progress
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;

  try {
    // Step 1: Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to save progress." },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
    const body = await request.json();
    const { chapterId, isCompleted } = body;

    // Validate required fields
    if (!chapterId) {
      return NextResponse.json(
        { error: "Missing required field: chapterId" },
        { status: 400 }
      );
    }

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { error: "Invalid field: isCompleted must be a boolean" },
        { status: 400 }
      );
    }

    // Step 3: Validate chapter exists and belongs to course
    const chapter = await db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    // Also check if it's a subchapter
    if (!chapter) {
      const subchapter = await db.subchapter.findFirst({
        where: {
          id: chapterId,
          chapter: {
            courseId: courseId,
          },
        },
        include: {
          chapter: {
            select: { id: true },
          },
        },
      });

      if (!subchapter) {
        return NextResponse.json(
          { error: "Chapter or subchapter not found in this course" },
          { status: 404 }
        );
      }
    }

    // Step 4: Check if user is enrolled in the course
    const enrollment = await db.course.findFirst({
      where: {
        id: courseId,
        students: {
          some: { id: session.user.id },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled in this course to track progress" },
        { status: 403 }
      );
    }

    // Step 5: Upsert progress record
    const progress = await db.progress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: chapterId,
        },
      },
      update: {
        isCompleted: isCompleted,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        courseId: courseId,
        chapterId: chapterId,
        isCompleted: isCompleted,
      },
    });

    // Step 5.5: Award or deduct points based on completion status
    let pointsAwarded = 0;

    if (isCompleted) {
      // MARKING AS COMPLETED - Award points
      try {
        // Check if course has points configured
        const coursePoints = await db.coursePoints.findUnique({
          where: { courseId },
        });

        if (coursePoints) {
          // Check if this is a re-completion by looking at existing completion record
          const existingCompletion = await db.chapterCompletion.findUnique({
            where: {
              userId_chapterId: {
                userId: session.user.id,
                chapterId: chapterId,
              },
            },
          });

          // Calculate points
          const originalBasePoints = Math.round(coursePoints.pointsPerChapter);
          let basePoints = originalBasePoints;
          let bonusPoints = 0;

          // If completion record exists, this is a re-completion (user completed, unmarked, and is completing again)
          if (existingCompletion) {
            // Re-completion: only give 30% of base points, no bonus
            basePoints = Math.round(originalBasePoints * 0.3);
          } else {
            // True first-time completion: give full points + 20% bonus
            bonusPoints = Math.round(originalBasePoints * 0.2);
          }

          const totalPoints = basePoints + bonusPoints;
          const finalPoints = totalPoints; // No multiplier applied in this simple version

          // Save chapter completion record
          await db.chapterCompletion.upsert({
            where: {
              userId_chapterId: {
                userId: session.user.id,
                chapterId: chapterId,
              },
            },
            update: {
              basePoints,
              bonusPoints,
              totalPoints,
              finalPoints,
              completionTime: 60, // Default 1 minute
              completedAt: new Date(),
              // Keep isFirstTime unchanged to preserve history
            },
            create: {
              userId: session.user.id,
              chapterId: chapterId,
              courseId: courseId,
              basePoints,
              bonusPoints,
              totalPoints,
              finalPoints,
              completionTime: 60, // Default 1 minute
              isFirstTime: true,
              isPerfectScore: false,
              hasSpeedBonus: false,
              streakMultiplier: 1.0,
              completedAt: new Date(),
            },
          });

          // Update user rank points
          const userRank = await db.userRank.findUnique({
            where: { userId: session.user.id },
          });

          if (userRank) {
            await db.userRank.update({
              where: { userId: session.user.id },
              data: {
                totalPoints: {
                  increment: totalPoints,
                },
                weeklyPoints: {
                  increment: totalPoints,
                },
              },
            });
          } else {
            // Create user rank if it doesn't exist
            await db.userRank.create({
              data: {
                userId: session.user.id,
                totalPoints: totalPoints,
                weeklyPoints: totalPoints,
                currentRank: 1, // Start at rank 1 (Bronze)
              },
            });
          }

          pointsAwarded = totalPoints;
        }
      } catch (pointsError) {
        console.error("Error awarding points:", pointsError);
        // Continue even if points fail - don't block progress tracking
      }
    } else {
      // UNMARKING AS COMPLETED - Deduct points
      try {
        // Get the chapter completion record to see how many points were awarded
        const chapterCompletion = await db.chapterCompletion.findUnique({
          where: {
            userId_chapterId: {
              userId: session.user.id,
              chapterId: chapterId,
            },
          },
        });

        if (chapterCompletion) {
          const pointsToDeduct = chapterCompletion.finalPoints;

          // Deduct points from user rank
          const userRank = await db.userRank.findUnique({
            where: { userId: session.user.id },
          });

          if (userRank) {
            // Ensure we don't go below 0
            const newTotalPoints = Math.max(
              0,
              userRank.totalPoints - pointsToDeduct
            );
            const newWeeklyPoints = Math.max(
              0,
              userRank.weeklyPoints - pointsToDeduct
            );

            await db.userRank.update({
              where: { userId: session.user.id },
              data: {
                totalPoints: newTotalPoints,
                weeklyPoints: newWeeklyPoints,
              },
            });
          }

          // DON'T delete the completion record - keep it for history
          // This preserves isFirstTime status for future re-completions
          // The Progress.isCompleted = false is enough to track current state

          pointsAwarded = -pointsToDeduct; // Negative to indicate deduction
        }
      } catch (pointsError) {
        console.error("Error deducting points:", pointsError);
        // Continue even if points fail - don't block progress tracking
      }
    }

    // Step 6: Get updated total progress
    const totalProgress = await db.progress.count({
      where: {
        userId: session.user.id,
        courseId: courseId,
        isCompleted: true,
      },
    });

    // Get total items count
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            subchapters: true,
          },
        },
      },
    });

    const totalItems = course
      ? course.chapters.reduce((sum, ch) => {
          return sum + 1 + ch.subchapters.length;
        }, 0)
      : 0;

    const newProgressPercentage =
      totalItems > 0 ? Math.round((totalProgress / totalItems) * 100) : 0;

    // TODO: Check for milestone achievements (25%, 50%, 75%, 100%)
    // TODO: Award badges for milestones
    // if (newProgressPercentage === 100) {
    //   await awardCompletionBadge(session.user.id, courseId);
    // }

    return NextResponse.json({
      message: isCompleted ? "Progress saved" : "Item marked as incomplete",
      chapterId,
      isCompleted,
      progressPercentage: newProgressPercentage,
      completedCount: totalProgress,
      totalCount: totalItems,
      pointsAwarded: pointsAwarded, // Return actual points (positive for award, negative for deduct)
      updatedAt: progress.updatedAt,
    });
  } catch (error) {
    console.error("Progress update error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid chapter or course ID" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to update progress. Please try again." },
      { status: 500 }
    );
  }
}
