import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all courses with their CourseDetails
    const courses = await db.course.findMany({
      include: {
        courseDetails: true,
      },
    });

    let updatedCount = 0;

    for (const course of courses) {
      if (course.courseDetails) {
        const currentInstructor = course.courseDetails.instructor as {
          name: string;
          avatar: string;
          rating: number;
          students: number;
        };

        // Check if it has the hardcoded "CodeWithHarry" data
        if (currentInstructor.name === "CodeWithHarry") {
          // Update with actual user data
          await db.courseDetails.update({
            where: {
              courseId: course.id,
            },
            data: {
              instructor: {
                name: session.user.name || "Instructor",
                avatar:
                  session.user.image ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                rating: currentInstructor.rating || 4.8,
                students: 0, // Reset to 0 instead of 15000
              },
            },
          });
          updatedCount++;
        }
      }
    }

    // Clear cache to reflect changes
    const { cache } = await import("@/lib/cache");
    cache.clear();

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} course(s) with correct instructor data`,
      updatedCount,
      totalCourses: courses.length,
    });
  } catch (error) {
    console.error("Error fixing instructor data:", error);
    return NextResponse.json(
      { error: "Failed to update instructor data" },
      { status: 500 }
    );
  }
}
