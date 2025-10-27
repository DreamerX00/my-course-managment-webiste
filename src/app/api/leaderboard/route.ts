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
    const courseId = searchParams.get("courseId"); // null = global leaderboard
    const search = searchParams.get("search") || "";
    const period = searchParams.get("period") || "all"; // all, week, month
    const limit = parseInt(searchParams.get("limit") || "50");

    // Calculate date filter based on period
    let dateFilter = {};
    if (period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }

    // Build quiz attempts query
    const quizAttemptsWhere: {
      createdAt?: { gte: Date };
      quiz?: { chapter?: { courseId?: string } };
      user?: { name?: { contains: string; mode: "insensitive" } };
    } = {};

    if (Object.keys(dateFilter).length > 0) {
      quizAttemptsWhere.createdAt = dateFilter as { gte: Date };
    }

    if (courseId) {
      quizAttemptsWhere.quiz = {
        chapter: {
          courseId: courseId,
        },
      };
    }

    if (search) {
      quizAttemptsWhere.user = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Get all quiz attempts with filters
    const quizAttempts = await db.quizAttempt.findMany({
      where: quizAttemptsWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: {
              select: {
                avatar: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Calculate user scores
    const userScores: Map<
      string,
      {
        id: string;
        name: string;
        image: string;
        avatar: string | null;
        title: string | null;
        totalScore: number;
        attemptCount: number;
      }
    > = new Map();

    quizAttempts.forEach((attempt) => {
      const userId = attempt.user.id;
      if (!userScores.has(userId)) {
        userScores.set(userId, {
          id: userId,
          name: attempt.user.name || "Unknown User",
          image: attempt.user.image || "",
          avatar: attempt.user.profile?.avatar || null,
          title: attempt.user.profile?.title || null,
          totalScore: 0,
          attemptCount: 0,
        });
      }
      const user = userScores.get(userId)!;
      user.totalScore += attempt.score;
      user.attemptCount += 1;
    });

    // Convert to array and sort by total score
    const leaderboardData = Array.from(userScores.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        displayAvatar: user.avatar || user.image,
      }));

    // Get current user's rank if not in top list
    const currentUserData = leaderboardData.find(
      (u) => u.id === session.user.id
    );
    let currentUserRank = null;

    if (!currentUserData) {
      const allUsers = Array.from(userScores.values()).sort(
        (a, b) => b.totalScore - a.totalScore
      );
      const userIndex = allUsers.findIndex((u) => u.id === session.user.id);
      if (userIndex !== -1) {
        currentUserRank = {
          ...allUsers[userIndex],
          rank: userIndex + 1,
          displayAvatar:
            allUsers[userIndex].avatar || allUsers[userIndex].image,
        };
      }
    }

    return NextResponse.json({
      leaderboard: leaderboardData,
      currentUser: currentUserData || currentUserRank,
      total: userScores.size,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
