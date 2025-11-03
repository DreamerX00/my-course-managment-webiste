import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { createRankPromotionNotification } from "@/lib/notifications";

interface CompleteChapterBody {
  chapterId: string;
  courseId: string;
  completionTime: number; // in seconds
  quizScore?: number; // percentage (0-100)
  expectedTime?: number; // expected completion time in seconds
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { userRank: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.userRank) {
      return NextResponse.json(
        { error: "User rank not initialized" },
        { status: 400 }
      );
    }

    const body: CompleteChapterBody = await req.json();
    const { chapterId, courseId, completionTime, quizScore, expectedTime } =
      body;

    // Validate required fields
    if (!chapterId || !courseId || !completionTime) {
      return NextResponse.json(
        {
          error: "Missing required fields: chapterId, courseId, completionTime",
        },
        { status: 400 }
      );
    }

    // Get course points configuration
    const coursePoints = await db.coursePoints.findUnique({
      where: { courseId },
    });

    if (!coursePoints) {
      return NextResponse.json(
        { error: "Course points not configured. Please contact admin." },
        { status: 404 }
      );
    }

    // Check if chapter was already completed
    const existingCompletion = await db.chapterCompletion.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
    });

    const isFirstTime = !existingCompletion;

    // Base points from course allocation
    const originalBasePoints = Math.round(coursePoints.pointsPerChapter);
    let basePoints = originalBasePoints;

    // If re-completion, only give 30% of base points (NO BONUSES)
    if (!isFirstTime) {
      basePoints = Math.round(originalBasePoints * 0.3);
    }

    // Calculate bonuses (ONLY for first-time completions)
    let bonusPoints = 0;
    const bonusBreakdown: Record<string, number> = {};

    // Check bonus conditions (needed for response even if not first-time)
    const isPerfectScore = quizScore !== undefined && quizScore >= 95;
    const hasSpeedBonus = expectedTime && completionTime < expectedTime * 0.75;

    if (isFirstTime) {
      // 1. First-time completion bonus (20% of base points)
      const firstTimeBonus = Math.round(originalBasePoints * 0.2);
      bonusPoints += firstTimeBonus;
      bonusBreakdown.firstTime = firstTimeBonus;

      // 2. Perfect score bonus (15% of base points)
      if (isPerfectScore) {
        const perfectBonus = Math.round(originalBasePoints * 0.15);
        bonusPoints += perfectBonus;
        bonusBreakdown.perfect = perfectBonus;
      }

      // 3. Speed bonus (10% of base points if completed in <75% of expected time)
      if (hasSpeedBonus) {
        const speedBonus = Math.round(originalBasePoints * 0.1);
        bonusPoints += speedBonus;
        bonusBreakdown.speed = speedBonus;
      }
    }

    // Total points before multiplier
    const totalPoints = basePoints + bonusPoints;

    // Calculate streak multiplier
    const streakDays = user.userRank.streakDays;
    let streakMultiplier = 1.0;

    if (streakDays >= 90) {
      streakMultiplier = 1.5; // Quarterly streak
    } else if (streakDays >= 30) {
      streakMultiplier = 1.25; // Monthly streak
    } else if (streakDays >= 7) {
      streakMultiplier = 1.1; // Weekly streak
    }

    // Final points with multiplier
    const finalPoints = Math.round(totalPoints * streakMultiplier);

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastStreakDate = new Date(user.userRank.lastStreakDate);
    lastStreakDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor(
      (today.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreakDays = user.userRank.streakDays;
    if (daysDiff === 0) {
      // Same day, no change
      newStreakDays = user.userRank.streakDays;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreakDays = user.userRank.streakDays + 1;
    } else {
      // Streak broken, reset to 1
      newStreakDays = 1;
    }

    // Get current rank configuration to check for promotion
    const currentRankConfig = await db.rankConfiguration.findUnique({
      where: { rankNumber: user.userRank.currentRank },
    });

    const newTotalPoints = user.userRank.totalPoints + finalPoints;
    let newRank = user.userRank.currentRank;

    // Check if user should be promoted based on points (not weekly evaluation)
    if (
      currentRankConfig?.maxPoints &&
      newTotalPoints >= currentRankConfig.maxPoints
    ) {
      const nextRank = await db.rankConfiguration.findUnique({
        where: { rankNumber: user.userRank.currentRank + 1 },
      });

      if (nextRank) {
        newRank = nextRank.rankNumber;
      }
    }

    // Use transaction to update all records atomically
    const result = await db.$transaction(async (tx) => {
      // Store initial rank for comparison
      const initialRank = user.userRank!.currentRank;
      const initialHighestRank = user.userRank!.highestRank;

      // Create or update chapter completion
      const completion = await tx.chapterCompletion.upsert({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId,
          },
        },
        create: {
          userId: user.id,
          chapterId,
          courseId,
          basePoints,
          bonusPoints,
          totalPoints,
          completionTime,
          isFirstTime: true,
          isPerfectScore,
          hasSpeedBonus: hasSpeedBonus || false,
          streakMultiplier,
          finalPoints,
        },
        update: {
          basePoints,
          bonusPoints,
          totalPoints,
          completionTime,
          isPerfectScore,
          hasSpeedBonus: hasSpeedBonus || false,
          streakMultiplier,
          finalPoints,
          completedAt: new Date(),
        },
      });

      // Update user rank
      const updatedRank = await tx.userRank.update({
        where: { userId: user.id },
        data: {
          totalPoints: newTotalPoints,
          weeklyPoints: { increment: finalPoints },
          currentRank: newRank,
          streakDays: newStreakDays,
          lastStreakDate: new Date(),
          lastActive: new Date(),
          highestRank: Math.max(newRank, initialHighestRank),
          promotionCount: newRank > initialRank ? { increment: 1 } : undefined,
        },
      });

      // Create rank history if promoted
      if (newRank > initialRank) {
        const now = new Date();
        const weekNumber = Math.ceil(
          (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );

        await tx.rankHistory.create({
          data: {
            userId: user.id,
            previousRank: initialRank,
            newRank,
            changeType: "PROMOTION",
            reason: `Reached ${newTotalPoints} points`,
            weekNumber,
            year: now.getFullYear(),
            pointsAtTime: newTotalPoints,
          },
        });

        // Send promotion notification
        try {
          const oldRankConfig = currentRankConfig;
          const newRankConfig = await tx.rankConfiguration.findUnique({
            where: { rankNumber: newRank },
          });

          if (oldRankConfig && newRankConfig) {
            await createRankPromotionNotification(
              user.id,
              {
                name: oldRankConfig.name,
                icon: oldRankConfig.icon,
              },
              {
                name: newRankConfig.name,
                icon: newRankConfig.icon,
              }
            );
          }
        } catch (notifError) {
          console.error(
            `Error sending rank promotion notification for user ${user.id}:`,
            notifError
          );
        }
      }

      // Mark progress as completed
      await tx.progress.upsert({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId,
          },
        },
        create: {
          userId: user.id,
          chapterId,
          courseId,
          isCompleted: true,
        },
        update: {
          isCompleted: true,
        },
      });

      return { completion, updatedRank };
    });

    return NextResponse.json({
      success: true,
      points: {
        basePoints,
        bonusPoints,
        bonusBreakdown,
        totalPoints,
        streakMultiplier,
        finalPoints,
      },
      rank: {
        current: result.updatedRank.currentRank,
        totalPoints: result.updatedRank.totalPoints,
        weeklyPoints: result.updatedRank.weeklyPoints,
        streakDays: result.updatedRank.streakDays,
        promoted: newRank > user.userRank.currentRank,
      },
      completion: result.completion,
    });
  } catch (error) {
    console.error("Error completing chapter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
