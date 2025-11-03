import { db } from "./db";

export type NotificationType =
  | "RANK_PROMOTION"
  | "RANK_DEMOTION"
  | "ACHIEVEMENT_UNLOCKED"
  | "WEEKLY_LEADERBOARD"
  | "MILESTONE"
  | "SYSTEM";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        relatedId: params.relatedId,
        metadata: params.metadata,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Create rank promotion notification
 */
export async function createRankPromotionNotification(
  userId: string,
  oldRank: { name: string; icon: string },
  newRank: { name: string; icon: string }
) {
  return createNotification({
    userId,
    type: "RANK_PROMOTION",
    title: "🎉 Rank Promoted!",
    message: `Congratulations! You've been promoted from ${oldRank.icon} ${oldRank.name} to ${newRank.icon} ${newRank.name}!`,
    metadata: {
      oldRank: oldRank.name,
      newRank: newRank.name,
    },
  });
}

/**
 * Create rank demotion notification
 */
export async function createRankDemotionNotification(
  userId: string,
  oldRank: { name: string; icon: string },
  newRank: { name: string; icon: string }
) {
  return createNotification({
    userId,
    type: "RANK_DEMOTION",
    title: "📉 Rank Changed",
    message: `Your rank has changed from ${oldRank.icon} ${oldRank.name} to ${newRank.icon} ${newRank.name}. Keep learning to climb back up!`,
    metadata: {
      oldRank: oldRank.name,
      newRank: newRank.name,
    },
  });
}

/**
 * Create achievement unlocked notification
 */
export async function createAchievementNotification(
  userId: string,
  achievement: {
    id: string;
    name: string;
    icon: string;
    pointsReward: number;
    rarity: string;
  }
) {
  return createNotification({
    userId,
    type: "ACHIEVEMENT_UNLOCKED",
    title: "🏆 Achievement Unlocked!",
    message: `You've unlocked the "${achievement.name}" achievement! Earned ${achievement.pointsReward} points.`,
    relatedId: achievement.id,
    metadata: {
      achievementName: achievement.name,
      pointsReward: achievement.pointsReward,
      rarity: achievement.rarity,
    },
  });
}

/**
 * Create weekly leaderboard notification
 */
export async function createWeeklyLeaderboardNotification(
  userId: string,
  position: number,
  zone: string,
  weeklyPoints: number
) {
  const zoneEmojis = {
    PROMOTION: "🚀",
    SAFE: "✅",
    DEMOTION: "⚠️",
  };

  const zoneMessages = {
    PROMOTION: "You're in the promotion zone! Keep it up!",
    SAFE: "You're safe for this week. Keep learning!",
    DEMOTION: "You're in the demotion zone. Time to study more!",
  };

  return createNotification({
    userId,
    type: "WEEKLY_LEADERBOARD",
    title: `${
      zoneEmojis[zone as keyof typeof zoneEmojis] || "📊"
    } Weekly Leaderboard Update`,
    message: `You're ranked #${position} this week with ${weeklyPoints} points. ${
      zoneMessages[zone as keyof typeof zoneMessages] || ""
    }`,
    metadata: {
      position,
      zone,
      weeklyPoints,
    },
  });
}

/**
 * Create milestone notification
 */
export async function createMilestoneNotification(
  userId: string,
  milestone: string,
  description: string
) {
  return createNotification({
    userId,
    type: "MILESTONE",
    title: "🎯 Milestone Reached!",
    message: `${milestone}: ${description}`,
    metadata: {
      milestone,
    },
  });
}
