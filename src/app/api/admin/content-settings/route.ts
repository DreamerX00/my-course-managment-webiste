import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from '@/lib/auth-options'
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json({ error: "Forbidden - Admin or Owner access required" }, { status: 403 })
    }

    console.log('Fetching content settings for admin:', session.user.email)

    // Get current content settings from database
    const settings = await db.contentSettings.findFirst()
    
    if (!settings) {
      console.log('No settings found, returning defaults')
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

    console.log('Found existing settings, returning:', settings.settings)
    return NextResponse.json(settings.settings)
  } catch (error) {
    console.error('Error fetching content settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content settings' }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin access
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json({ error: "Forbidden - Admin or Owner access required" }, { status: 403 })
    }

    console.log('Saving content settings for admin:', session.user.email)

    const body = await req.json()
    const { filterCategories, featuredCourses, layoutOptions } = body

    console.log('Received settings:', { filterCategories, featuredCourses, layoutOptions })

    // Validate featured courses (must be exactly 4 if provided)
    if (featuredCourses && featuredCourses.length > 0 && featuredCourses.length !== 4) {
      console.log('Invalid featured courses count:', featuredCourses.length)
      return NextResponse.json(
        { error: "Featured courses must be exactly 4 if provided" }, 
        { status: 400 }
      )
    }

    // Upsert content settings
    const settings = await db.contentSettings.upsert({
      where: { id: "main" },
      update: {
        settings: {
          filterCategories: filterCategories || [],
          featuredCourses: featuredCourses || [],
          layoutOptions: layoutOptions || {}
        },
        updatedAt: new Date()
      },
      create: {
        id: "main",
        settings: {
          filterCategories: filterCategories || [],
          featuredCourses: featuredCourses || [],
          layoutOptions: layoutOptions || {}
        }
      }
    })

    console.log('Settings saved successfully:', settings.settings)
    return NextResponse.json(settings.settings)
  } catch (error) {
    console.error('Error updating content settings:', error)
    return NextResponse.json(
      { error: 'Failed to update content settings' }, 
      { status: 500 }
    )
  }
} 
