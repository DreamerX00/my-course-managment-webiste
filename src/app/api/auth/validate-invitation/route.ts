import { NextRequest, NextResponse } from "next/server";
import { validateInvitationToken, getCourseName } from "@/lib/invitation";

// Force dynamic rendering for Next.js 15+
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const validation = await validateInvitationToken(token);

    if (!validation.valid || !validation.invitation) {
      return NextResponse.json(
        { error: validation.error || "Invalid invitation" },
        { status: 400 }
      );
    }

    const { invitation } = validation;

    // Get course name if courseId is provided
    const courseName = invitation.courseId
      ? await getCourseName(invitation.courseId)
      : null;

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        courseName,
        message: invitation.message,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("[VALIDATE_INVITATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
