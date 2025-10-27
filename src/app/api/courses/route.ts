import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { createCourseSchema } from "@/lib/validations";
import { validateRequest } from "@/lib/validation-helpers";
import { withCache } from "@/lib/cache";

// Enable ISR with 5-minute revalidation instead of forcing dynamic
export const revalidate = 300;

interface AdminCategory {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface InstructorData {
  name?: string;
  avatar?: string;
  rating?: number;
  students?: number;
}

interface CourseDetailsSettings {
  filterCategories?: AdminCategory[];
  [key: string]: unknown;
}

interface CourseDetailsData {
  title?: string;
  description?: string;
  instructor?: InstructorData;
  category?: string;
  price?: number;
  rating?: number;
  enrolledCount?: number;
  duration?: string;
  isFree?: boolean;
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  const showAll = req.nextUrl?.searchParams.get("all") === "true";
  const cacheKey = `courses-${showAll ? "all" : "published"}`;

  try {
    // Use caching for published courses
    const transformedCourses = await withCache(
      cacheKey,
      async () => {
        // Get content settings for categories
        const contentSettings = await db.contentSettings.findFirst();
        const settings =
          (contentSettings?.settings as CourseDetailsSettings) || {};
        const adminCategories = settings.filterCategories || [
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
          { id: "blockchain", name: "Blockchain", color: "#EF4444", order: 5 },
        ];

        // Optimized query - use select and _count instead of full includes
        const courses = await db.course.findMany({
          where: showAll ? undefined : { isPublished: true },
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            price: true,
            isPublished: true,
            createdAt: true,
            updatedAt: true,
            courseDetails: true,
            _count: {
              select: {
                students: true,
                chapters: true,
              },
            },
            chapters: {
              select: {
                id: true,
                _count: {
                  select: {
                    lessons: true,
                    subchapters: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        // Transform the data to match our frontend interface
        return courses.map((course) => {
          const totalChapters = course._count.chapters;
          const totalLessons = course.chapters.reduce(
            (acc: number, chapter) =>
              acc + chapter._count.lessons + chapter._count.subchapters,
            0
          );
          const estimatedHours = Math.round((totalLessons * 30) / 60);
          const enrolledCount = course._count.students;
          const details = course.courseDetails as CourseDetailsData | null;

          // Determine category
          const assignedCategory =
            details?.category ||
            getCategoryFromTitle(course.title, adminCategories);

          // Use CourseDetails fields if available, otherwise fallback
          return {
            id: course.id,
            title: details?.title || course.title,
            description: details?.description || course.description,
            instructor:
              (details?.instructor as InstructorData)?.name || "CodeWithHarry",
            category: assignedCategory,
            price: details?.price ?? course.price ?? 0,
            rating: details?.rating
              ? Math.round(details.rating * 10) / 10
              : 4.5,
            enrolledCount: details?.enrolledCount ?? enrolledCount,
            duration: details?.duration || `${estimatedHours} hours`,
            chaptersCount: totalChapters,
            thumbnail:
              course.thumbnail ||
              "https://images.unsplash.com/photo-1517694712202-14dd953bb09f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            isFree: details?.isFree ?? (!course.price || course.price === 0),
            isPublished: course.isPublished,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
          };
        });
      },
      showAll ? 60 : 300 // Cache admin view for 1min, public for 5min
    );

    return NextResponse.json(transformedCourses, {
      headers: {
        "Cache-Control": showAll
          ? "private, max-age=60" // Admin: short cache
          : "public, s-maxage=300, stale-while-revalidate=600", // Public: CDN cache
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      {
        status: 500,
        headers: {
          // Cache errors briefly to prevent thundering herd
          "Cache-Control": "public, s-maxage=10, stale-if-error=300",
        },
      }
    );
  }
}

// Helper function to determine category from title using admin-configured categories
function getCategoryFromTitle(
  title: string,
  adminCategories: AdminCategory[]
): string {
  const titleLower = title.toLowerCase();

  // Map keywords to admin category names
  const categoryMapping: { [key: string]: string } = {};

  adminCategories.forEach((cat) => {
    const catName = cat.name.toLowerCase();
    if (catName.includes("web") || catName.includes("development")) {
      categoryMapping["web"] = cat.name;
      categoryMapping["html"] = cat.name;
      categoryMapping["css"] = cat.name;
      categoryMapping["javascript"] = cat.name;
      categoryMapping["react"] = cat.name;
      categoryMapping["node"] = cat.name;
    }
    if (catName.includes("data") || catName.includes("science")) {
      categoryMapping["data"] = cat.name;
      categoryMapping["python"] = cat.name;
      categoryMapping["analytics"] = cat.name;
      categoryMapping["visualization"] = cat.name;
    }
    if (
      catName.includes("ai") ||
      catName.includes("machine") ||
      catName.includes("learning")
    ) {
      categoryMapping["ai"] = cat.name;
      categoryMapping["ml"] = cat.name;
      categoryMapping["neural"] = cat.name;
      categoryMapping["deep"] = cat.name;
    }
    if (catName.includes("mobile")) {
      categoryMapping["mobile"] = cat.name;
      categoryMapping["flutter"] = cat.name;
      categoryMapping["react native"] = cat.name;
      categoryMapping["ios"] = cat.name;
      categoryMapping["android"] = cat.name;
    }
    if (catName.includes("blockchain")) {
      categoryMapping["blockchain"] = cat.name;
      categoryMapping["crypto"] = cat.name;
      categoryMapping["ethereum"] = cat.name;
      categoryMapping["bitcoin"] = cat.name;
    }
  });

  // Check for matches
  for (const [keyword, categoryName] of Object.entries(categoryMapping)) {
    if (titleLower.includes(keyword)) {
      return categoryName;
    }
  }

  // Default to first category if no match found
  return adminCategories.length > 0 ? adminCategories[0].name : "Programming";
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !["ADMIN", "INSTRUCTOR", "OWNER"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();

    // Validate request body
    const validation = await validateRequest(body, createCourseSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { title, description, price, category } = validation.data;
    const { imageUrl } = body; // Optional field not in base schema

    // Create the course
    const course = await db.course.create({
      data: {
        title,
        description,
        price: price || 0,
        thumbnail: imageUrl,
        isPublished: true,
      },
    });

    // Create CourseDetails with the selected category
    if (category) {
      await db.courseDetails.create({
        data: {
          courseId: course.id,
          title: title,
          category: category,
          tags: ["New Course"],
          instructor: {
            name: "CodeWithHarry",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
            rating: 4.8,
            students: 15000,
          },
          rating: 4.5,
          enrolledCount: 0,
          duration: "10 hours",
          price: price || 0,
          originalPrice: (price || 0) * 1.5,
          isFree: !price || price === 0,
          description: description,
          features: [
            {
              title: "Lifetime Access",
              description: "Access to all course content forever",
            },
            {
              title: "Certificate",
              description: "Get a certificate upon completion",
            },
            {
              title: "Community Support",
              description: "Join our community of learners",
            },
          ],
        },
      });
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

// Temporary endpoint to create sample course details for testing
export async function PUT(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === "create-sample-details") {
      // Get content settings for categories
      const contentSettings = await db.contentSettings.findFirst();
      const settings =
        (contentSettings?.settings as CourseDetailsSettings) || {};
      const adminCategories = settings.filterCategories || [
        { id: "web-dev", name: "Web Development", color: "#3B82F6", order: 1 },
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
        { id: "blockchain", name: "Blockchain", color: "#EF4444", order: 5 },
      ];

      // Get all courses
      const courses = await db.course.findMany();

      // Create sample course details for each course
      for (const course of courses) {
        // Check if course details already exist
        const existingDetails = await db.courseDetails.findUnique({
          where: { courseId: course.id },
        });

        if (!existingDetails) {
          // Determine category based on title using the same logic as getCategoryFromTitle
          const titleLower = course.title.toLowerCase();
          let category = adminCategories[0].name; // default to first category

          if (
            titleLower.includes("web") ||
            titleLower.includes("html") ||
            titleLower.includes("css") ||
            titleLower.includes("javascript") ||
            titleLower.includes("react") ||
            titleLower.includes("typescript")
          ) {
            category =
              adminCategories.find(
                (cat: AdminCategory) =>
                  cat.name.toLowerCase().includes("web") ||
                  cat.name.toLowerCase().includes("development")
              )?.name || adminCategories[0].name;
          } else if (
            titleLower.includes("data") ||
            titleLower.includes("python") ||
            titleLower.includes("analytics")
          ) {
            category =
              adminCategories.find(
                (cat: AdminCategory) =>
                  cat.name.toLowerCase().includes("data") ||
                  cat.name.toLowerCase().includes("science")
              )?.name || adminCategories[0].name;
          } else if (
            titleLower.includes("ai") ||
            titleLower.includes("machine") ||
            titleLower.includes("ml")
          ) {
            category =
              adminCategories.find(
                (cat: AdminCategory) =>
                  cat.name.toLowerCase().includes("ai") ||
                  cat.name.toLowerCase().includes("machine")
              )?.name || adminCategories[0].name;
          } else if (
            titleLower.includes("mobile") ||
            titleLower.includes("flutter") ||
            titleLower.includes("react native")
          ) {
            category =
              adminCategories.find((cat: AdminCategory) =>
                cat.name.toLowerCase().includes("mobile")
              )?.name || adminCategories[0].name;
          } else if (
            titleLower.includes("blockchain") ||
            titleLower.includes("crypto")
          ) {
            category =
              adminCategories.find((cat: AdminCategory) =>
                cat.name.toLowerCase().includes("blockchain")
              )?.name || adminCategories[0].name;
          }

          await db.courseDetails.create({
            data: {
              courseId: course.id,
              title: course.title,
              category: category,
              tags: ["Beginner", "Popular"],
              instructor: {
                name: "CodeWithHarry",
                avatar:
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                rating: 4.8,
                students: 15000,
              },
              rating: 4.5,
              enrolledCount: Math.floor(Math.random() * 1000) + 100,
              duration: "10 hours",
              price: course.price || 29.99,
              originalPrice: (course.price || 29.99) * 1.5,
              isFree: !course.price || course.price === 0,
              description: course.description,
              features: [
                {
                  title: "Lifetime Access",
                  description: "Access to all course content forever",
                },
                {
                  title: "Certificate",
                  description: "Get a certificate upon completion",
                },
                {
                  title: "Community Support",
                  description: "Join our community of learners",
                },
              ],
            },
          });
        }
      }

      return NextResponse.json({
        message: "Sample course details created successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error creating sample course details:", error);
    return NextResponse.json(
      { error: "Failed to create sample course details" },
      { status: 500 }
    );
  }
}
