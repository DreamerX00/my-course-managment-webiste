import {
  PrismaClient,
  AchievementCategory,
  AchievementRarity,
} from "@prisma/client";

const prisma = new PrismaClient();

const rankConfigurations = [
  {
    rankNumber: 1,
    name: "Knowledge Seeker",
    icon: "🌱",
    color: "#10b981", // green-500
    description:
      "You've taken your first steps into the world of learning. Every journey begins with curiosity!",
    minPoints: 0,
    maxPoints: 1000,
    estimatedWeeks: 2,
    tier: "NOVICE",
    isAnimated: false,
  },
  {
    rankNumber: 2,
    name: "Curious Learner",
    icon: "🔍",
    color: "#3b82f6", // blue-500
    description:
      "Your curiosity drives you forward. You're exploring new topics and building foundations.",
    minPoints: 1000,
    maxPoints: 2500,
    estimatedWeeks: 4,
    tier: "NOVICE",
    isAnimated: false,
  },
  {
    rankNumber: 3,
    name: "Dedicated Student",
    icon: "📚",
    color: "#6366f1", // indigo-500
    description:
      "Consistency is your strength. You're committed to regular learning and growth.",
    minPoints: 2500,
    maxPoints: 5000,
    estimatedWeeks: 6,
    tier: "NOVICE",
    isAnimated: false,
  },
  {
    rankNumber: 4,
    name: "Knowledge Enthusiast",
    icon: "🎓",
    color: "#8b5cf6", // violet-500
    description:
      "Learning is becoming your passion. You're expanding your horizons across multiple domains.",
    minPoints: 5000,
    maxPoints: 10000,
    estimatedWeeks: 10,
    tier: "INTERMEDIATE",
    isAnimated: false,
  },
  {
    rankNumber: 5,
    name: "Diligent Scholar",
    icon: "📖",
    color: "#a855f7", // purple-500
    description:
      "Your dedication is remarkable. You're diving deep into complex subjects with confidence.",
    minPoints: 10000,
    maxPoints: 15000,
    estimatedWeeks: 15,
    tier: "INTERMEDIATE",
    isAnimated: false,
  },
  {
    rankNumber: 6,
    name: "Academic Achiever",
    icon: "🏆",
    color: "#d946ef", // fuchsia-500
    description:
      "Excellence is your standard. Your achievements speak to your hard work and talent.",
    minPoints: 15000,
    maxPoints: 25000,
    estimatedWeeks: 20,
    tier: "INTERMEDIATE",
    isAnimated: true,
  },
  {
    rankNumber: 7,
    name: "Wisdom Seeker",
    icon: "🧠",
    color: "#ec4899", // pink-500
    description:
      "You're not just learning facts—you're seeking understanding and wisdom.",
    minPoints: 25000,
    maxPoints: 40000,
    estimatedWeeks: 28,
    tier: "ADVANCED",
    isAnimated: true,
  },
  {
    rankNumber: 8,
    name: "Master Student",
    icon: "⚡",
    color: "#f59e0b", // amber-500
    description:
      "You've mastered the art of learning. Your skills and knowledge are truly impressive.",
    minPoints: 40000,
    maxPoints: 55000,
    estimatedWeeks: 36,
    tier: "ADVANCED",
    isAnimated: true,
  },
  {
    rankNumber: 9,
    name: "Knowledge Guardian",
    icon: "🛡️",
    color: "#f97316", // orange-500
    description:
      "You protect and preserve knowledge. Your expertise guides others on their journey.",
    minPoints: 55000,
    maxPoints: 75000,
    estimatedWeeks: 45,
    tier: "ADVANCED",
    isAnimated: true,
  },
  {
    rankNumber: 10,
    name: "Enlightened Mind",
    icon: "💡",
    color: "#ef4444", // red-500
    description:
      "Enlightenment comes from persistence. Your understanding transcends ordinary learning.",
    minPoints: 75000,
    maxPoints: 100000,
    estimatedWeeks: 52,
    tier: "EXPERT",
    isAnimated: true,
  },
  {
    rankNumber: 11,
    name: "Academic Luminary",
    icon: "✨",
    color: "#dc2626", // red-600
    description:
      "You shine as a beacon of knowledge. Your insights illuminate the path for countless others.",
    minPoints: 100000,
    maxPoints: 150000,
    estimatedWeeks: 65,
    tier: "EXPERT",
    isAnimated: true,
  },
  {
    rankNumber: 12,
    name: "Wisdom Sage",
    icon: "🔮",
    color: "#991b1b", // red-800
    description:
      "Wisdom flows through you. Your depth of understanding is matched by few.",
    minPoints: 150000,
    maxPoints: 200000,
    estimatedWeeks: 80,
    tier: "EXPERT",
    isAnimated: true,
  },
  {
    rankNumber: 13,
    name: "Grand Maestro",
    icon: "👑",
    color: "#fbbf24", // yellow-400
    description:
      "You've reached legendary status. Your mastery across multiple domains is extraordinary.",
    minPoints: 200000,
    maxPoints: 350000,
    estimatedWeeks: 104,
    tier: "LEGENDARY",
    isAnimated: true,
  },
  {
    rankNumber: 14,
    name: "Omniscient Scholar",
    icon: "🌟",
    color: "#fcd34d", // yellow-300
    description:
      "The pinnacle of achievement. Your knowledge knows no bounds—you are a true master of learning.",
    minPoints: 350000,
    maxPoints: null,
    estimatedWeeks: 130,
    tier: "LEGENDARY",
    isAnimated: true,
  },
];

const achievements = [
  {
    code: "STREAK_MASTER_7",
    name: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    category: "STREAK" as AchievementCategory,
    requirement: { streakDays: 7 },
    pointsReward: 100,
    rarity: "COMMON" as AchievementRarity,
  },
  {
    code: "STREAK_MASTER_30",
    name: "Monthly Maven",
    description: "Maintain a 30-day learning streak",
    icon: "🔥",
    category: "STREAK" as AchievementCategory,
    requirement: { streakDays: 30 },
    pointsReward: 500,
    rarity: "RARE" as AchievementRarity,
  },
  {
    code: "STREAK_MASTER_90",
    name: "Quarterly Champion",
    description: "Maintain a 90-day learning streak",
    icon: "🔥",
    category: "STREAK" as AchievementCategory,
    requirement: { streakDays: 90 },
    pointsReward: 2000,
    rarity: "EPIC" as AchievementRarity,
  },
  {
    code: "STREAK_MASTER_365",
    name: "Year Legend",
    description: "Maintain a 365-day learning streak",
    icon: "🔥",
    category: "STREAK" as AchievementCategory,
    requirement: { streakDays: 365 },
    pointsReward: 10000,
    rarity: "LEGENDARY" as AchievementRarity,
  },
  {
    code: "PERFECTIONIST_5",
    name: "Perfect Start",
    description: "Complete 5 chapters with perfect scores",
    icon: "💯",
    category: "PERFECTION" as AchievementCategory,
    requirement: { perfectScores: 5 },
    pointsReward: 200,
    rarity: "COMMON" as AchievementRarity,
  },
  {
    code: "PERFECTIONIST_25",
    name: "Excellence Seeker",
    description: "Complete 25 chapters with perfect scores",
    icon: "💯",
    category: "PERFECTION" as AchievementCategory,
    requirement: { perfectScores: 25 },
    pointsReward: 1000,
    rarity: "RARE" as AchievementRarity,
  },
  {
    code: "PERFECTIONIST_100",
    name: "Perfection Master",
    description: "Complete 100 chapters with perfect scores",
    icon: "💯",
    category: "PERFECTION" as AchievementCategory,
    requirement: { perfectScores: 100 },
    pointsReward: 5000,
    rarity: "LEGENDARY" as AchievementRarity,
  },
  {
    code: "SPEED_DEMON_10",
    name: "Quick Learner",
    description: "Complete 10 chapters with speed bonus",
    icon: "⚡",
    category: "SPEED" as AchievementCategory,
    requirement: { speedBonuses: 10 },
    pointsReward: 150,
    rarity: "COMMON" as AchievementRarity,
  },
  {
    code: "SPEED_DEMON_50",
    name: "Lightning Mind",
    description: "Complete 50 chapters with speed bonus",
    icon: "⚡",
    category: "SPEED" as AchievementCategory,
    requirement: { speedBonuses: 50 },
    pointsReward: 800,
    rarity: "RARE" as AchievementRarity,
  },
  {
    code: "COURSE_CONQUEROR_1",
    name: "First Victory",
    description: "Complete your first course",
    icon: "🎯",
    category: "COMPLETION" as AchievementCategory,
    requirement: { coursesCompleted: 1 },
    pointsReward: 500,
    rarity: "COMMON" as AchievementRarity,
  },
  {
    code: "COURSE_CONQUEROR_5",
    name: "Knowledge Collector",
    description: "Complete 5 courses",
    icon: "🎯",
    category: "COMPLETION" as AchievementCategory,
    requirement: { coursesCompleted: 5 },
    pointsReward: 2500,
    rarity: "RARE" as AchievementRarity,
  },
  {
    code: "COURSE_CONQUEROR_10",
    name: "Course Master",
    description: "Complete 10 courses",
    icon: "🎯",
    category: "COMPLETION" as AchievementCategory,
    requirement: { coursesCompleted: 10 },
    pointsReward: 5000,
    rarity: "EPIC" as AchievementRarity,
  },
  {
    code: "EARLY_BIRD",
    name: "Early Bird",
    description: "Complete a chapter before 8 AM",
    icon: "🌅",
    category: "SPECIAL" as AchievementCategory,
    requirement: { completionTimeRange: "00:00-08:00" },
    pointsReward: 100,
    rarity: "COMMON" as AchievementRarity,
  },
  {
    code: "NIGHT_OWL",
    name: "Night Owl",
    description: "Complete a chapter after 10 PM",
    icon: "🦉",
    category: "SPECIAL" as AchievementCategory,
    requirement: { completionTimeRange: "22:00-23:59" },
    pointsReward: 100,
    rarity: "COMMON" as AchievementRarity,
  },
  {
    code: "MILESTONE_10K",
    name: "10K Club",
    description: "Reach 10,000 total points",
    icon: "🏅",
    category: "MILESTONE" as AchievementCategory,
    requirement: { totalPoints: 10000 },
    pointsReward: 500,
    rarity: "RARE" as AchievementRarity,
  },
  {
    code: "MILESTONE_50K",
    name: "50K Elite",
    description: "Reach 50,000 total points",
    icon: "🏅",
    category: "MILESTONE" as AchievementCategory,
    requirement: { totalPoints: 50000 },
    pointsReward: 2500,
    rarity: "EPIC" as AchievementRarity,
  },
  {
    code: "MILESTONE_100K",
    name: "100K Legend",
    description: "Reach 100,000 total points",
    icon: "🏅",
    category: "MILESTONE" as AchievementCategory,
    requirement: { totalPoints: 100000 },
    pointsReward: 5000,
    rarity: "LEGENDARY" as AchievementRarity,
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Clearing existing rank configurations and achievements...");
  await prisma.achievement.deleteMany();
  await prisma.rankConfiguration.deleteMany();

  // Seed rank configurations
  console.log("📊 Seeding rank configurations...");
  for (const rank of rankConfigurations) {
    await prisma.rankConfiguration.create({
      data: rank,
    });
  }
  console.log(`✅ Created ${rankConfigurations.length} rank configurations`);

  // Seed achievements
  console.log("🏆 Seeding achievements...");
  for (const achievement of achievements) {
    await prisma.achievement.create({
      data: achievement,
    });
  }
  console.log(`✅ Created ${achievements.length} achievements`);

  // Get all users and create UserRank for existing users
  console.log("👥 Initializing user ranks...");
  const users = await prisma.user.findMany({
    where: {
      userRank: null,
    },
  });

  for (const user of users) {
    await prisma.userRank.create({
      data: {
        userId: user.id,
        currentRank: 1,
        totalPoints: 0,
        weeklyPoints: 0,
        streakDays: 0,
        lastActive: new Date(),
        lastStreakDate: new Date(),
        highestRank: 1,
        promotionCount: 0,
        demotionCount: 0,
        achievements: [],
        immunityWeeks: 2, // 2 weeks immunity for new users
      },
    });
  }
  console.log(`✅ Initialized ranks for ${users.length} users`);

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
