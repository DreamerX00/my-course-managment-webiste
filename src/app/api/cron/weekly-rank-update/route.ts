import { NextRequest, NextResponse } from "next/server";
import { weeklyRankUpdate } from "@/lib/cron/weeklyRankUpdate";

/**
 * Weekly Rank Update Cron Endpoint
 *
 * This endpoint should be called by:
 * 1. Vercel Cron (recommended for production)
 * 2. External cron service (e.g., cron-job.org)
 * 3. Manual trigger by admin
 *
 * Configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-rank-update",
 *     "schedule": "59 23 * * 0"  // Every Sunday at 11:59 PM
 *   }]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Check if request is from Vercel Cron or has valid secret
    const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron");
    const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isVercelCron && !hasValidSecret) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid cron secret" },
        { status: 401 }
      );
    }

    console.warn("🔄 Weekly rank update triggered");

    // Run the weekly rank update
    const result = await weeklyRankUpdate();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Weekly rank update completed successfully",
        data: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Weekly rank update completed with errors",
          data: result,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in cron endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

// Allow POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}
