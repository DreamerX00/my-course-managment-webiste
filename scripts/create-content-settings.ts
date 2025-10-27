import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL, // Use direct connection, not Accelerate
    },
  },
});

async function main() {
  console.log("🔍 Checking if ContentSettings table exists...");

  try {
    // Try to query the table
    const count = await prisma.contentSettings.count();
    console.log(`✅ ContentSettings table exists with ${count} records`);

    if (count === 0) {
      console.log("📝 Creating default content settings...");
      await prisma.contentSettings.create({
        data: {
          settings: {
            filterCategories: [
              {
                id: "web-dev",
                name: "Web Development",
                color: "#3B82F6",
                order: 1,
              },
              {
                id: "data-science",
                name: "Data Science",
                color: "#10B981",
                order: 2,
              },
              {
                id: "ai-ml",
                name: "AI & Machine Learning",
                color: "#8B5CF6",
                order: 3,
              },
              {
                id: "mobile-dev",
                name: "Mobile Development",
                color: "#F59E0B",
                order: 4,
              },
              {
                id: "blockchain",
                name: "Blockchain",
                color: "#EF4444",
                order: 5,
              },
            ],
            featuredCourses: [],
            layoutOptions: {
              gridColumns: 3,
              showFiltersSidebar: true,
              showSortingDropdown: true,
              showTrendingSection: true,
              showRecentlyAdded: true,
            },
          },
        },
      });
      console.log("✅ Default content settings created successfully!");
    }
  } catch (error: any) {
    if (error.code === "P2021") {
      console.error(
        "❌ ERROR: ContentSettings table does NOT exist in the database!"
      );
      console.error("\n📋 Please run migrations:");
      console.error("   npx prisma migrate deploy");
      console.error("   OR");
      console.error("   npx prisma db push");
    } else {
      console.error("❌ Error:", error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
