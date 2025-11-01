import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withCache } from "@/lib/cache";

// Enable ISR with 5-minute revalidation (reduced from 1 hour for better updates)
export const revalidate = 300;

export async function GET() {
  try {
    // Use caching for content settings
    const settingsData = await withCache(
      "content-settings",
      async () => {
        // Get content settings from database with Accelerate caching
        const settings = await db.contentSettings.findFirst({
          cacheStrategy: {
            ttl: 300, // Cache for 5 minutes (reduced from 1 hour)
            swr: 600, // Serve stale for 10 minutes while revalidating
          },
        });

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
      300 // Cache for 5 minutes in our application cache
    );

    return NextResponse.json(settingsData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "CDN-Cache-Control": "public, s-maxage=600",
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
