import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCache } from "@/lib/cache";

// Enable ISR with 1-hour revalidation
export const revalidate = 3600;

export async function GET() {
  try {
    // Cache content settings for 1 hour
    const settingsData = await withCache(
      "content-settings",
      async () => {
        // Get content settings from database
        const settings = await db.contentSettings.findFirst();

        if (!settings) {
          // Return default settings if none exist
          return {
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
          };
        }

        return settings.settings;
      },
      3600 // 1 hour TTL
    );

    return NextResponse.json(settingsData, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "CDN-Cache-Control": "public, s-maxage=7200",
      },
    });
  } catch (error) {
    console.error("Error fetching content settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch content settings" },
      {
        status: 500,
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-if-error=300",
        },
      }
    );
  }
}
