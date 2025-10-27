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
        profile: {
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

    const profile = {
      name: user.name || "User",
      email: user.email || "",
      image: user.image || "",
      role: user.role,
      courses: coursesWithProgress,
      totalScore,
      completedCourses,
      // UserProfile data
      bio: user.profile?.bio || null,
      title: user.profile?.title || null,
      location: user.profile?.location || null,
      phone: user.profile?.phone || null,
      linkedin: user.profile?.linkedin || null,
      github: user.profile?.github || null,
      twitter: user.profile?.twitter || null,
      website: user.profile?.website || null,
      youtube: user.profile?.youtube || null,
      instagram: user.profile?.instagram || null,
      avatar: user.profile?.avatar || user.image || "",
      bannerImage: user.profile?.bannerImage || null,
      isPublic: user.profile?.isPublic ?? true,
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
      avatar,
      banner,
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
        avatar,
        bannerImage: banner,
        isPublic: true,
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
        avatar,
        bannerImage: banner,
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
