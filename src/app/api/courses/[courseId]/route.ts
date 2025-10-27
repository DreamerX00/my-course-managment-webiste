import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

interface CourseUpdateData {
  title?: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  isPublished?: boolean;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: {
            position: "asc",
          },
          include: {
            subchapters: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
        courseDetails: true,
      },
      cacheStrategy: {
        ttl: 300, // 5 minutes cache for individual course
        swr: 600, // 10 minutes stale-while-revalidate
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_ID_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !["ADMIN", "INSTRUCTOR", "OWNER"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await db.course.delete({ where: { id: courseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await context.params;
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !["ADMIN", "INSTRUCTOR", "OWNER"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await req.json();
    const { title, description, price, thumbnail, isPublished, category } =
      data;

    // Update course data
    const updateData: CourseUpdateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const course = await db.course.update({
      where: { id: courseId },
      data: updateData,
    });

    // Handle category update in CourseDetails
    if (category !== undefined) {
      // Check if CourseDetails exists
      const existingDetails = await db.courseDetails.findUnique({
        where: { courseId: courseId },
      });

      if (existingDetails) {
        // Update existing CourseDetails
        await db.courseDetails.update({
          where: { courseId: courseId },
          data: {
            category: category,
            title: title || existingDetails.title,
            description: description || existingDetails.description,
            price: price !== undefined ? price : existingDetails.price,
            isFree:
              price !== undefined
                ? !price || price === 0
                : existingDetails.isFree,
          },
        });
      } else {
        // Create new CourseDetails
        await db.courseDetails.create({
          data: {
            courseId: courseId,
            title: title || course.title,
            category: category,
            tags: ["Updated Course"],
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
            price: price !== undefined ? price : course.price || 0,
            originalPrice:
              (price !== undefined ? price : course.price || 0) * 1.5,
            isFree:
              price !== undefined
                ? !price || price === 0
                : !course.price || course.price === 0,
            description: description || course.description,
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

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}
