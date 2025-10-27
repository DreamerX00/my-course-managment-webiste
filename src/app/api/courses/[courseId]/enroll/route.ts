/**
 * @fileoverview Auto-Enrollment API Route
 * @description Handles automatic course enrollment for authenticated users
 *
 * Features:
 * - POST: Enroll user in course (automatic, no payment required)
 * - GET: Check if user is already enrolled
 * - Connects User to Course via many-to-many relation
 *
 * @route POST /api/courses/[courseId]/enroll - Enroll user
 * @route GET /api/courses/[courseId]/enroll - Check enrollment status
 *
 * TODO: Add email notification when user enrolls
 * TODO: Add analytics tracking for enrollments
 * TODO: Add course capacity limits (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = "force-dynamic";

/**
 * POST /api/courses/[courseId]/enroll
 *
 * Enrolls authenticated user in the specified course.
 * - Checks if user is already enrolled (idempotent operation)
 * - Creates connection between User and Course
 * - Returns enrollment status
 *
 * @param request - Next.js request object
 * @param context - Route context with courseId param
 * @returns JSON response with enrollment status
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
        { error: "Unauthorized. Please login to enroll." },
        { status: 401 }
      );
    }

    // Step 2: Validate course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        isPublished: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Step 3: Check if course is published
    if (!course.isPublished) {
      return NextResponse.json(
        { error: "This course is not yet published" },
        { status: 403 }
      );
    }

    // Step 4: Check if user is already enrolled
    const existingEnrollment = await db.course.findFirst({
      where: {
        id: courseId,
        students: {
          some: { id: session.user.id },
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        message: "Already enrolled in this course",
        enrolled: true,
        courseId: courseId,
        courseTitle: course.title,
      });
    }

    // Step 5: Enroll user (connect User to Course)
    await db.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: session.user.id },
        },
      },
    });

    // TODO: Send enrollment confirmation email
    // await sendEnrollmentEmail(session.user.email, course.title);

    // TODO: Track enrollment analytics
    // await trackEvent('course_enrollment', { courseId, userId: session.user.id });

    return NextResponse.json({
      message: "Successfully enrolled in course",
      enrolled: true,
      courseId: courseId,
      courseTitle: course.title,
      enrolledAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Enrollment error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return NextResponse.json(
          { error: "Course not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to enroll in course. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses/[courseId]/enroll
 *
 * Checks if the authenticated user is enrolled in the course.
 * - Returns enrollment status
 * - Used to show "Start Learning" vs "Continue Learning" button
 *
 * @param request - Next.js request object
 * @param context - Route context with courseId param
 * @returns JSON response with enrollment status
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;

  try {
    // Step 1: Get session (no error if not authenticated)
    const session = await getServerSession(authOptions);

    // If not authenticated, user is not enrolled
    if (!session?.user?.id) {
      return NextResponse.json({
        enrolled: false,
        courseId: courseId,
      });
    }

    // Step 2: Check enrollment status
    const enrollment = await db.course.findFirst({
      where: {
        id: courseId,
        students: {
          some: { id: session.user.id },
        },
      },
      select: {
        id: true,
        title: true,
        students: {
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const isEnrolled = !!enrollment;

    return NextResponse.json({
      enrolled: isEnrolled,
      courseId: courseId,
      ...(isEnrolled && {
        courseTitle: enrollment.title,
        enrolledUser: enrollment.students[0],
      }),
    });
  } catch (error) {
    console.error("Enrollment check error:", error);

    // Return false on error (fail gracefully)
    return NextResponse.json({
      enrolled: false,
      courseId: courseId,
      error: "Failed to check enrollment status",
    });
  }
}
