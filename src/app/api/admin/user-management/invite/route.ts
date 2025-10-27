import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { createInvitation, getCourseName } from "@/lib/invitation";
import { sendInvitationEmail } from "@/lib/email";
import { inviteUserSchema } from "@/lib/validations";
import { validateRequest } from "@/lib/validation-helpers";

// Force dynamic rendering for Next.js 15+
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow Admin and Owner roles for invitations
    if (
      session?.user?.role !== UserRole.ADMIN &&
      session?.user?.role !== UserRole.OWNER
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Validate request body
    const validation = await validateRequest(body, inviteUserSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { email, name, role } = validation.data;
    const { courseId, message } = body; // Optional fields not in schema

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          error: "An invitation has already been sent to this email address",
        },
        { status: 400 }
      );
    }

    // Create invitation record
    const invitation = await createInvitation(
      email,
      role || UserRole.STUDENT,
      courseId === "none" ? null : courseId,
      message,
      session.user.id
    );

    // Get course name if courseId is provided
    const courseName =
      courseId && courseId !== "none" ? await getCourseName(courseId) : null;

    // Generate signup URL with invitation token
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const signupUrl = `${baseUrl}/auth/signup?token=${invitation.token}`;

    // Send invitation email
    try {
      await sendInvitationEmail(
        email,
        name ?? null,
        role || UserRole.STUDENT,
        courseName,
        message,
        signupUrl
      );
    } catch (emailError) {
      // If email fails, delete the invitation and return error
      await db.invitation.delete({
        where: { id: invitation.id },
      });
      console.error("Email sending failed:", emailError);
      return NextResponse.json(
        {
          error:
            "Failed to send invitation email. Please check your email configuration.",
        },
        { status: 500 }
      );
    }

    // Invitation created successfully - removed console.log for production
    // TODO: Add proper logging service (e.g., Winston, Pino)

    return NextResponse.json({
      message: "Invitation sent successfully",
      invitationId: invitation.id,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error("[USER_INVITE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
