import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

// Force dynamic rendering for Next.js 15+
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "all"; // all, weekly
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get current week number for weekly leaderboard
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    const currentWeek = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    // Get all rank configurations
    const ranks = await db.rankConfiguration.findMany({
      orderBy: { rankNumber: "asc" },
    });
    const rankMap = new Map(ranks.map((r) => [r.rankNumber, r]));

    let leaderboardData;

    if (period === "weekly") {
      // Get weekly leaderboard from WeeklyLeaderboard table
      const weeklyEntries = await db.weeklyLeaderboard.findMany({
        where: {
          weekNumber: currentWeek,
          year: now.getFullYear(),
          ...(search && {
            user: {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          }),
        },
        include: {
          user: {
            include: {
              userRank: true,
              userProfile: {
                select: {
                  avatar: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          weeklyPoints: "desc",
        },
        take: limit,
        cacheStrategy: {
          ttl: 60,
          swr: 120,
        },
      });

      leaderboardData = weeklyEntries.map((entry, index) => {
        const rank = rankMap.get(entry.user.userRank?.currentRank || 1);
        return {
          id: entry.userId,
          name: entry.user.name || "Unknown User",
          displayAvatar:
            entry.user.userProfile?.avatar || entry.user.image || "",
          title: entry.user.userProfile?.title || null,
          weeklyPoints: entry.weeklyPoints,
          totalPoints: entry.user.userRank?.totalPoints || 0,
          rank: index + 1,
          currentRank: rank?.name || "Beginner",
          rankIcon: rank?.icon || "🌱",
          rankColor: rank?.color || "#10b981",
          streak: entry.user.userRank?.streakDays || 0,
          totalCompletions: entry.totalPoints, // Using weeklyLeaderboard totalPoints as completions
        };
      });
    } else {
      // Get all-time leaderboard from UserRank
      const whereClause = search
        ? {
            user: {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          }
        : {};

      const allTimeEntries = await db.userRank.findMany({
        where: whereClause,
        include: {
          user: {
            include: {
              userProfile: {
                select: {
                  avatar: true,
                  title: true,
                },
              },
            },
          },
          completions: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          totalPoints: "desc",
        },
        take: limit,
        cacheStrategy: {
          ttl: 60,
          swr: 120,
        },
      });

      leaderboardData = allTimeEntries.map((entry, index) => {
        const rank = rankMap.get(entry.currentRank);
        // Count completions
        const totalCompletions = entry.completions?.length || 0;

        return {
          id: entry.userId,
          name: entry.user.name || "Unknown User",
          displayAvatar:
            entry.user.userProfile?.avatar || entry.user.image || "",
          title: entry.user.userProfile?.title || null,
          weeklyPoints: entry.weeklyPoints,
          totalPoints: entry.totalPoints,
          rank: index + 1,
          currentRank: rank?.name || "Beginner",
          rankIcon: rank?.icon || "🌱",
          rankColor: rank?.color || "#10b981",
          streak: entry.streakDays,
          totalCompletions,
          lastActive: entry.lastActive,
        };
      });
    }

    // Get current user's position
    const currentUserRank = await db.userRank.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          include: {
            userProfile: {
              select: {
                avatar: true,
                title: true,
              },
            },
          },
        },
        completions: true,
      },
    });

    let currentUserData = null;
    if (currentUserRank) {
      const rank = rankMap.get(currentUserRank.currentRank);

      // Get user's position in the leaderboard
      const userPosition = await db.userRank.count({
        where: {
          totalPoints: {
            gt: currentUserRank.totalPoints,
          },
        },
      });

      currentUserData = {
        id: currentUserRank.userId,
        name: currentUserRank.user.name || "Unknown User",
        displayAvatar:
          currentUserRank.user.userProfile?.avatar ||
          currentUserRank.user.image ||
          "",
        title: currentUserRank.user.userProfile?.title || null,
        weeklyPoints: currentUserRank.weeklyPoints,
        totalPoints: currentUserRank.totalPoints,
        rank: userPosition + 1,
        currentRank: rank?.name || "Beginner",
        rankIcon: rank?.icon || "🌱",
        rankColor: rank?.color || "#10b981",
        streak: currentUserRank.streakDays,
        totalCompletions: currentUserRank.completions?.length || 0,
      };
    }

    // Get total number of users
    const total = await db.userRank.count();

    return NextResponse.json({
      leaderboard: leaderboardData,
      currentUser: currentUserData,
      total,
      period,
      week: period === "weekly" ? currentWeek : undefined,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
