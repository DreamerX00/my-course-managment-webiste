import { db } from "@/lib/db";
import { LeaderboardZone, RankChangeType } from "@prisma/client";

interface WeeklyRankUpdateResult {
  success: boolean;
  weekNumber: number;
  year: number;
  stats: {
    usersEvaluated: number;
    promotions: number;
    demotions: number;
    maintained: number;
  };
  errors?: string[];
}

/**
 * Weekly Rank Update Cron Job
 * Runs every Sunday at 11:59 PM
 * Evaluates all users based on weekly points and updates ranks
 */
export async function weeklyRankUpdate(): Promise<WeeklyRankUpdateResult> {
  const startTime = new Date();
  const errors: string[] = [];

  // Calculate current week number and year
  const now = new Date();
  const weekNumber = getWeekNumber(now);
  const year = now.getFullYear();

  console.warn(
    `🔄 Starting weekly rank update for Week ${weekNumber}, ${year}`
  );

  const stats = {
    usersEvaluated: 0,
    promotions: 0,
    demotions: 0,
    maintained: 0,
  };

  try {
    // Create evaluation log
    const evaluationLog = await db.weeklyEvaluationLog.create({
      data: {
        weekNumber,
        year,
        usersEvaluated: 0,
        promotions: 0,
        demotions: 0,
        maintained: 0,
        startedAt: startTime,
        completedAt: startTime,
        status: "RUNNING",
      },
    });

    // Get all active users with ranks, sorted by weekly points
    const users = await db.userRank.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
      where: {
        user: {
          status: "ACTIVE",
        },
      },
      orderBy: {
        weeklyPoints: "desc",
      },
    });

    console.warn(`📊 Evaluating ${users.length} active users`);

    // Define thresholds
    const PROMOTION_THRESHOLD = 500; // Min points per week to be eligible for promotion
    const SAFE_THRESHOLD = 200; // Min points per week to maintain rank

    // Process each user
    for (let i = 0; i < users.length; i++) {
      const userRank = users[i];
      const leaderboardPosition = i + 1;

      try {
        // Determine zone
        let zone: LeaderboardZone;
        if (leaderboardPosition <= 10) {
          zone = "PROMOTION";
        } else if (leaderboardPosition <= 50) {
          zone = "SAFE";
        } else {
          zone = "DEMOTION";
        }

        // Get current rank configuration
        const currentRankConfig = await db.rankConfiguration.findUnique({
          where: { rankNumber: userRank.currentRank },
        });

        if (!currentRankConfig) {
          errors.push(
            `No rank config found for user ${userRank.userId} with rank ${userRank.currentRank}`
          );
          continue;
        }

        let newRank = userRank.currentRank;
        let changeType: RankChangeType = "MAINTAIN";
        let reason = "";

        // Skip immunity period for new users (first 2 weeks)
        const isImmune = userRank.immunityWeeks > 0;

        // Skip if rank is frozen (premium feature)
        const isFrozen = userRank.frozenUntil && userRank.frozenUntil > now;

        if (isImmune) {
          reason = "New user immunity";
        } else if (isFrozen) {
          reason = "Rank freeze active";
        } else {
          // PROMOTION ZONE (Top 10)
          if (zone === "PROMOTION") {
            if (userRank.weeklyPoints >= PROMOTION_THRESHOLD) {
              // Check if there's a next rank
              const nextRankConfig = await db.rankConfiguration.findUnique({
                where: { rankNumber: userRank.currentRank + 1 },
              });

              if (nextRankConfig) {
                newRank = nextRankConfig.rankNumber;
                changeType = "PROMOTION";
                reason = `Top ${leaderboardPosition} with ${userRank.weeklyPoints} weekly points`;
                stats.promotions++;
              } else {
                // Already at max rank
                reason = `Top ${leaderboardPosition} (already at max rank)`;
                stats.maintained++;
              }
            } else {
              reason = `Top ${leaderboardPosition} but insufficient weekly points (${userRank.weeklyPoints}/${PROMOTION_THRESHOLD})`;
              stats.maintained++;
            }
          }
          // SAFE ZONE (11-50)
          else if (zone === "SAFE") {
            if (userRank.weeklyPoints >= SAFE_THRESHOLD) {
              reason = `Position ${leaderboardPosition} with ${userRank.weeklyPoints} weekly points (safe)`;
              stats.maintained++;
            } else {
              reason = `Position ${leaderboardPosition} with insufficient weekly points (${userRank.weeklyPoints}/${SAFE_THRESHOLD})`;
              stats.maintained++;
            }
          }
          // DEMOTION ZONE (51+)
          else {
            if (
              userRank.weeklyPoints < SAFE_THRESHOLD &&
              userRank.currentRank > 1
            ) {
              // Demote to previous rank
              const previousRankConfig = await db.rankConfiguration.findUnique({
                where: { rankNumber: userRank.currentRank - 1 },
              });

              if (previousRankConfig) {
                newRank = previousRankConfig.rankNumber;
                changeType = "DEMOTION";
                reason = `Position ${leaderboardPosition} with only ${userRank.weeklyPoints} weekly points`;
                stats.demotions++;
              } else {
                reason = `Position ${leaderboardPosition} (already at lowest rank)`;
                stats.maintained++;
              }
            } else {
              reason = `Position ${leaderboardPosition} with ${userRank.weeklyPoints} weekly points`;
              stats.maintained++;
            }
          }
        }

        // Create leaderboard entry
        await db.weeklyLeaderboard.create({
          data: {
            weekNumber,
            year,
            userId: userRank.userId,
            rank: leaderboardPosition,
            weeklyPoints: userRank.weeklyPoints,
            totalPoints: userRank.totalPoints,
            currentRank: newRank,
            rankChange: userRank.lastWeekRank
              ? leaderboardPosition - userRank.lastWeekRank
              : 0,
            zone,
          },
        });

        // Update user rank
        await db.userRank.update({
          where: { userId: userRank.userId },
          data: {
            currentRank: newRank,
            lastWeekRank: leaderboardPosition,
            weeklyPoints: 0, // Reset weekly points
            immunityWeeks: isImmune
              ? Math.max(0, userRank.immunityWeeks - 1)
              : 0,
            promotionCount:
              changeType === "PROMOTION" ? { increment: 1 } : undefined,
            demotionCount:
              changeType === "DEMOTION" ? { increment: 1 } : undefined,
            highestRank: Math.max(newRank, userRank.highestRank),
          },
        });

        // Create rank history entry if rank changed
        if (changeType !== "MAINTAIN") {
          await db.rankHistory.create({
            data: {
              userId: userRank.userId,
              previousRank: userRank.currentRank,
              newRank,
              changeType,
              reason,
              weekNumber,
              year,
              pointsAtTime: userRank.totalPoints,
            },
          });
        }

        stats.usersEvaluated++;

        console.warn(
          `✅ User ${userRank.user.name}: ${changeType} (${userRank.currentRank} → ${newRank})`
        );
      } catch (error) {
        const errorMsg = `Error processing user ${userRank.userId}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Update evaluation log
    await db.weeklyEvaluationLog.update({
      where: { id: evaluationLog.id },
      data: {
        usersEvaluated: stats.usersEvaluated,
        promotions: stats.promotions,
        demotions: stats.demotions,
        maintained: stats.maintained,
        completedAt: new Date(),
        status: "COMPLETED",
        errorLog: errors.length > 0 ? errors.join("\n") : null,
      },
    });

    console.warn(`✅ Weekly rank update completed!`);
    console.warn(`📊 Stats:`, stats);

    return {
      success: true,
      weekNumber,
      year,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("❌ Fatal error in weekly rank update:", error);

    return {
      success: false,
      weekNumber,
      year,
      stats,
      errors: [String(error)],
    };
  }
}

/**
 * Get ISO week number for a date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Reset all weekly points (can be called manually if needed)
 */
export async function resetWeeklyPoints(): Promise<void> {
  await db.userRank.updateMany({
    data: {
      weeklyPoints: 0,
    },
  });
  console.warn("✅ All weekly points reset to 0");
}
