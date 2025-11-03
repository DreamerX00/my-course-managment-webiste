import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const userRank = await db.userRank.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        completions: {
          orderBy: { completedAt: "desc" },
          take: 10,
        },
        rankHistory: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!userRank) {
      return NextResponse.json(
        { error: "User rank not found" },
        { status: 404 }
      );
    }

    // Get current rank configuration
    const rankConfig = await db.rankConfiguration.findUnique({
      where: { rankNumber: userRank.currentRank },
    });

    // Get next rank configuration
    const nextRankConfig = await db.rankConfiguration.findUnique({
      where: { rankNumber: userRank.currentRank + 1 },
    });

    // Calculate progress to next rank
    let progressPercentage = 100;
    if (nextRankConfig && rankConfig) {
      const pointsInCurrentRank = userRank.totalPoints - rankConfig.minPoints;
      const pointsNeededForNextRank =
        nextRankConfig.minPoints - rankConfig.minPoints;
      progressPercentage = Math.min(
        100,
        Math.round((pointsInCurrentRank / pointsNeededForNextRank) * 100)
      );
    }

    // Get leaderboard position
    const leaderboardPosition = await db.userRank.count({
      where: {
        totalPoints: {
          gt: userRank.totalPoints,
        },
      },
    });

    return NextResponse.json({
      success: true,
      userRank: {
        ...userRank,
        currentRankConfig: rankConfig,
        nextRankConfig,
        progressPercentage,
        leaderboardPosition: leaderboardPosition + 1,
      },
    });
  } catch (error) {
    console.error("Error fetching user rank:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
