import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// Force dynamic rendering for Next.js 15+
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get content settings from database
    const settings = await db.contentSettings.findFirst()
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        filterCategories: [
          { id: "web-dev", name: "Web Development", color: "#3B82F6", order: 1 },
          { id: "data-science", name: "Data Science", color: "#10B981", order: 2 },
          { id: "ai-ml", name: "AI & Machine Learning", color: "#8B5CF6", order: 3 },
          { id: "mobile-dev", name: "Mobile Development", color: "#F59E0B", order: 4 },
          { id: "blockchain", name: "Blockchain", color: "#EF4444", order: 5 }
        ],
        featuredCourses: [],
        layoutOptions: {
          gridColumns: 3,
          showFiltersSidebar: true,
          showSortingDropdown: true,
          showTrendingSection: true,
          showRecentlyAdded: true
        }
      }
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings.settings)
  } catch (error) {
    console.error('Error fetching content settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content settings' }, 
      { status: 500 }
    )
  }
} 