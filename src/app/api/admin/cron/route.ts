import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import {
  weeklyRankUpdate,
  resetWeeklyPoints,
} from "@/lib/cron/weeklyRankUpdate";
import { db } from "@/lib/db";

/**
 * Admin endpoint to manually trigger weekly rank update
 * Only accessible by ADMIN and OWNER roles
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === "run") {
      console.warn(`Manual weekly rank update triggered by ${user.name}`);

      const result = await weeklyRankUpdate();

      return NextResponse.json({
        success: true,
        message: "Weekly rank update completed",
        data: result,
      });
    } else if (action === "reset-weekly-points") {
      console.warn(`Weekly points reset triggered by ${user.name}`);

      await resetWeeklyPoints();

      return NextResponse.json({
        success: true,
        message: "All weekly points reset to 0",
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "run" or "reset-weekly-points"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in admin cron trigger:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Get weekly evaluation logs
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get recent evaluation logs
    const logs = await db.weeklyEvaluationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Error fetching evaluation logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
