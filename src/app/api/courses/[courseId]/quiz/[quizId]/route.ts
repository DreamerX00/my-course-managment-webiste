/**
 * @fileoverview Quiz API Route
 * @description Handles quiz retrieval and submission
 *
 * Features:
 * - GET: Fetch quiz questions (without answers for security)
 * - POST: Submit quiz answers and calculate score
 * - Saves quiz attempts to database
 * - Updates leaderboard automatically
 *
 * @route GET /api/courses/[courseId]/quiz/[quizId] - Get quiz questions
 * @route POST /api/courses/[courseId]/quiz/[quizId] - Submit quiz answers
 *
 * SECURITY NOTE: Never send correct answers to frontend in GET request
 *
 * TODO: Add time limit for quizzes
 * TODO: Add quiz attempt history
 * TODO: Add retry limit (max 3 attempts per quiz)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = "force-dynamic";

/**
 * GET /api/courses/[courseId]/quiz/[quizId]
 *
 * Retrieves quiz questions for display to user.
 * IMPORTANT: Does NOT include correct answers for security.
 *
 * @param request - Next.js request object
 * @param context - Route context with courseId and quizId params
 * @returns JSON response with quiz questions (answers excluded)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; quizId: string }> }
) {
  const { courseId, quizId } = await context.params;

  try {
    // Step 1: Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to take quiz." },
        { status: 401 }
      );
    }

    // Step 2: Verify user is enrolled in the course
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
        { error: "You must be enrolled in this course to take the quiz" },
        { status: 403 }
      );
    }

    // Step 3: Fetch quiz with questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            options: true,
            points: true,
            // IMPORTANT: Do NOT include 'answer' field for security
          },
          orderBy: { createdAt: "asc" },
        },
        chapter: {
          select: {
            id: true,
            courseId: true,
            title: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Step 4: Verify quiz belongs to the specified course
    if (quiz.chapter.courseId !== courseId) {
      return NextResponse.json(
        { error: "Quiz does not belong to this course" },
        { status: 400 }
      );
    }

    // Step 5: Calculate total possible points
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    // Step 6: Get user's previous attempts (optional)
    const previousAttempts = await db.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        quizId: quizId,
      },
      select: {
        score: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5, // Last 5 attempts
    });

    // TODO: Check if user has exceeded max attempts
    // if (previousAttempts.length >= 3) {
    //   return NextResponse.json(
    //     { error: 'Maximum quiz attempts reached (3)' },
    //     { status: 429 }
    //   );
    // }

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      chapterId: quiz.chapterId,
      chapterTitle: quiz.chapter.title,
      totalQuestions: quiz.questions.length,
      totalPoints,
      questions: quiz.questions,
      previousAttempts: previousAttempts.map((a) => ({
        score: a.score,
        attemptedAt: a.createdAt,
      })),
      attemptsRemaining: Math.max(0, 3 - previousAttempts.length), // TODO: Make configurable
    });
  } catch (error) {
    console.error("Quiz fetch error:", error);

    return NextResponse.json(
      { error: "Failed to load quiz. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[courseId]/quiz/[quizId]
 *
 * Submits user's quiz answers and calculates score.
 * - Validates answers against correct answers
 * - Calculates score percentage
 * - Saves attempt to database
 * - Updates leaderboard automatically
 *
 * @param request - Next.js request object
 * @param context - Route context with courseId and quizId params
 * @returns JSON response with score and results
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ courseId: string; quizId: string }> }
) {
  const { courseId, quizId } = await context.params;

  try {
    // Step 1: Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to submit quiz." },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
    const body = await request.json();
    const { answers } = body; // Format: { questionId: selectedAnswer }

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Invalid request: answers object required" },
        { status: 400 }
      );
    }

    // Step 3: Verify user is enrolled
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
        { error: "You must be enrolled in this course" },
        { status: 403 }
      );
    }

    // Step 4: Fetch quiz with correct answers
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true, // Include 'answer' field for grading
        chapter: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Step 5: Verify quiz belongs to course
    if (quiz.chapter.courseId !== courseId) {
      return NextResponse.json(
        { error: "Quiz does not belong to this course" },
        { status: 400 }
      );
    }

    // Step 6: Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedAnswers: Record<
      string,
      {
        correct: boolean;
        userAnswer: string;
        correctAnswer: string;
      }
    > = {};

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.answer;

      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }

      gradedAnswers[question.id] = {
        correct: isCorrect,
        userAnswer: userAnswer || "No answer",
        correctAnswer: question.answer,
      };
    }

    // Step 7: Calculate percentage score
    const scorePercentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Step 8: Determine pass/fail status
    const passingScore = 70; // TODO: Make this configurable per quiz
    const passed = scorePercentage >= passingScore;

    // Step 9: Save quiz attempt to database
    const quizAttempt = await db.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId: quizId,
        score: scorePercentage,
        answers: answers, // Store as JSON
      },
    });

    // Step 10: Update user's total quiz score (for leaderboard)
    // This happens automatically through the QuizAttempt relation

    // TODO: Award badges for perfect scores
    // if (scorePercentage === 100) {
    //   await awardPerfectScoreBadge(session.user.id, quizId);
    // }

    // TODO: Send quiz completion notification
    // await sendQuizCompletionEmail(session.user.email, quiz.title, scorePercentage);

    return NextResponse.json({
      message: passed ? "Quiz passed!" : "Quiz completed",
      attemptId: quizAttempt.id,
      score: scorePercentage,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      earnedPoints,
      totalPoints,
      passed,
      passingScore,
      gradedAnswers, // Detailed results
      submittedAt: quizAttempt.createdAt,
    });
  } catch (error) {
    console.error("Quiz submission error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid quiz or course ID" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to submit quiz. Please try again." },
      { status: 500 }
    );
  }
}
