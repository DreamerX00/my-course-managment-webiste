import { NextRequest, NextResponse } from "next/server";
import {
  validateInvitationToken,
  markInvitationAsUsed,
} from "@/lib/invitation";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { completeSignupSchema } from "@/lib/validations";
import { validateRequest } from "@/lib/validation-helpers";

// Force dynamic rendering for Next.js 15+
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const bodyValidation = await validateRequest(body, completeSignupSchema);
    if (!bodyValidation.success) {
      return bodyValidation.error;
    }

    const { token, name, password } = bodyValidation.data;

    // Validate invitation token
    const tokenValidation = await validateInvitationToken(token);

    if (!tokenValidation.valid || !tokenValidation.invitation) {
      return NextResponse.json(
        { error: tokenValidation.error || "Invalid invitation" },
        { status: 400 }
      );
    }

    const { invitation } = tokenValidation;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email: invitation.email,
        name,
        password: hashedPassword,
        role: invitation.role,
        status: "ACTIVE",
      },
    });

    // Enroll in course if specified
    if (invitation.courseId) {
      await db.user.update({
        where: { id: user.id },
        data: {
          enrolledCourses: {
            connect: { id: invitation.courseId },
          },
        },
      });
    }

    // Mark invitation as used
    await markInvitationAsUsed(token);

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[COMPLETE_SIGNUP_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
