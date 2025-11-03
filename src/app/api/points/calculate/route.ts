import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

interface CalculatePointsBody {
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

    const body: CalculatePointsBody = await req.json();
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
    const userRank = user.userRank;
    let streakMultiplier = 1.0;

    if (userRank) {
      const streakDays = userRank.streakDays;

      if (streakDays >= 90) {
        streakMultiplier = 1.5; // Quarterly streak
      } else if (streakDays >= 30) {
        streakMultiplier = 1.25; // Monthly streak
      } else if (streakDays >= 7) {
        streakMultiplier = 1.1; // Weekly streak
      }
    }

    // Final points with multiplier
    const finalPoints = Math.round(totalPoints * streakMultiplier);

    // Return calculation breakdown without saving
    return NextResponse.json({
      success: true,
      calculation: {
        basePoints,
        bonusPoints,
        bonusBreakdown,
        totalPoints,
        streakMultiplier,
        finalPoints,
        isFirstTime,
        isPerfectScore,
        hasSpeedBonus,
        streakDays: userRank?.streakDays || 0,
      },
    });
  } catch (error) {
    console.error("Error calculating points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
