import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations";
import { validateRequest } from "@/lib/validation-helpers";

// Force dynamic rendering for Next.js 15+
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile with related data
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        userProfile: {
          select: {
            bio: true,
            title: true,
            location: true,
            phone: true,
            linkedin: true,
            github: true,
            twitter: true,
            website: true,
            youtube: true,
            instagram: true,
            avatar: true,
            bannerImage: true,
            isPublic: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's enrolled courses with progress
    const enrolledCourses = await db.course.findMany({
      where: {
        students: {
          some: {
            id: session.user.id,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        createdAt: true,
      },
    });

    // Fetch progress for each course
    const coursesWithProgress = await Promise.all(
      enrolledCourses.map(async (course) => {
        const totalChapters = await db.chapter.count({
          where: { courseId: course.id },
        });

        const completedChapters = await db.progress.count({
          where: {
            userId: session.user.id,
            courseId: course.id,
            isCompleted: true,
          },
        });

        const progress =
          totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

        return {
          id: course.id,
          title: course.title,
          progress: Math.round(progress),
          lastAccessed: course.createdAt.toISOString(),
        };
      })
    );

    // Get total score from quiz attempts
    const quizAttempts = await db.quizAttempt.findMany({
      where: { userId: session.user.id },
      select: { score: true },
    });

    const totalScore = quizAttempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );

    // Count completed courses
    const completedCourses = coursesWithProgress.filter(
      (course) => course.progress === 100
    ).length;

    // Fetch user rank data
    const userRank = await db.userRank.findUnique({
      where: { userId: session.user.id },
      include: {
        completions: {
          select: {
            id: true,
          },
        },
        rankHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    // Get rank configuration for current rank
    let rankInfo = null;
    let nextRankInfo = null;
    let progressToNextRank = 0;

    if (userRank) {
      const currentRankConfig = await db.rankConfiguration.findUnique({
        where: { rankNumber: userRank.currentRank },
      });

      const nextRankConfig = await db.rankConfiguration.findFirst({
        where: { rankNumber: userRank.currentRank + 1 },
        orderBy: { rankNumber: "asc" },
      });

      rankInfo = currentRankConfig
        ? {
            name: currentRankConfig.name,
            icon: currentRankConfig.icon,
            color: currentRankConfig.color,
            description: currentRankConfig.description,
            tier: currentRankConfig.tier,
            minPoints: currentRankConfig.minPoints,
            maxPoints: currentRankConfig.maxPoints,
          }
        : null;

      nextRankInfo = nextRankConfig
        ? {
            name: nextRankConfig.name,
            icon: nextRankConfig.icon,
            color: nextRankConfig.color,
            minPoints: nextRankConfig.minPoints,
          }
        : null;

      // Calculate progress to next rank
      if (currentRankConfig && nextRankConfig) {
        const currentPoints = userRank.totalPoints;
        const pointsNeeded =
          nextRankConfig.minPoints - currentRankConfig.minPoints;
        const pointsEarned = currentPoints - currentRankConfig.minPoints;
        progressToNextRank = Math.min(
          100,
          Math.max(0, (pointsEarned / pointsNeeded) * 100)
        );
      }
    }

    // Fetch achievements
    const allAchievements = await db.achievement.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        icon: true,
        category: true,
        rarity: true,
        pointsReward: true,
      },
    });

    const unlockedAchievements = allAchievements.filter((achievement) =>
      userRank?.achievements.includes(achievement.code)
    );

    const profile = {
      name: user.name || "User",
      email: user.email || "",
      image: user.image || "",
      role: user.role,
      courses: coursesWithProgress,
      totalScore,
      completedCourses,
      // Rank data
      rank: userRank
        ? {
            totalPoints: userRank.totalPoints,
            weeklyPoints: userRank.weeklyPoints,
            currentRank: rankInfo,
            nextRank: nextRankInfo,
            progressToNextRank: Math.round(progressToNextRank),
            streakDays: userRank.streakDays,
            highestRank: userRank.highestRank,
            promotionCount: userRank.promotionCount,
            demotionCount: userRank.demotionCount,
            totalCompletions: userRank.completions?.length || 0,
            rankHistory: userRank.rankHistory,
          }
        : null,
      achievements: {
        unlocked: unlockedAchievements,
        total: allAchievements.length,
      },
      // UserProfile data
      bio: user.userProfile?.bio || null,
      title: user.userProfile?.title || null,
      location: user.userProfile?.location || null,
      phone: user.userProfile?.phone || null,
      linkedin: user.userProfile?.linkedin || null,
      github: user.userProfile?.github || null,
      twitter: user.userProfile?.twitter || null,
      website: user.userProfile?.website || null,
      youtube: user.userProfile?.youtube || null,
      instagram: user.userProfile?.instagram || null,
      avatar: user.userProfile?.avatar || user.image || "",
      bannerImage: user.userProfile?.bannerImage || null,
      isPublic: user.userProfile?.isPublic ?? true,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = await validateRequest(body, updateProfileSchema);
    if (!validation.success) {
      return validation.error;
    }

    const {
      name,
      bio,
      title,
      location,
      phone,
      linkedin,
      github,
      twitter,
      website,
      youtube,
      instagram,
      avatar,
      bannerImage,
      isPublic,
    } = validation.data;

    // Update user name if provided
    if (name !== undefined) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Upsert UserProfile
    await db.userProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        bio,
        title,
        location,
        phone,
        linkedin,
        github,
        twitter,
        website,
        youtube,
        instagram,
        avatar,
        bannerImage,
        isPublic: isPublic ?? true,
      },
      update: {
        bio,
        title,
        location,
        phone,
        linkedin,
        github,
        twitter,
        website,
        youtube,
        instagram,
        avatar,
        bannerImage,
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
