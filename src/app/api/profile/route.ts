import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

        const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

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

    const totalScore = quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);

    // Count completed courses
    const completedCourses = coursesWithProgress.filter(
      (course) => course.progress === 100
    ).length;

    const profile = {
      name: user.name || 'User',
      email: user.email || '',
      image: user.image || '',
      role: user.role,
      courses: coursesWithProgress,
      totalScore,
      completedCourses,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
