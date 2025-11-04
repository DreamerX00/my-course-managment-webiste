import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    // Fetch course details from database
    const courseDetails = await db.courseDetails.findUnique({
      where: { courseId },
    });

    if (courseDetails) {
      return NextResponse.json(courseDetails);
    } else {
      return NextResponse.json(
        { error: "Content details not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      { error: "Failed to fetch content details" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();

    // Upsert course details (create or update)
    const courseDetails = await db.courseDetails.upsert({
      where: { courseId },
      update: {
        title: body.title,
        category: body.category,
        tags: body.tags,
        instructor: body.instructor,
        rating: body.rating,
        enrolledCount: body.enrolledCount,
        duration: body.duration,
        price: body.price,
        originalPrice: body.originalPrice,
        isFree: body.isFree,
        description: body.description,
        features: body.features,
        updatedAt: new Date(),
      },
      create: {
        courseId,
        title: body.title,
        category: body.category,
        tags: body.tags,
        instructor: body.instructor,
        rating: body.rating,
        enrolledCount: body.enrolledCount,
        duration: body.duration,
        price: body.price,
        originalPrice: body.originalPrice,
        isFree: body.isFree,
        description: body.description,
        features: body.features,
      },
    });

    // Clear cache to ensure fresh data is loaded
    const { cache } = await import("@/lib/cache");
    cache.delete("courses-all");
    cache.delete("courses-published");
    cache.clear(); // Clear all cache

    return NextResponse.json(
      { message: "Content details saved successfully", data: courseDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving course details:", error);
    return NextResponse.json(
      { error: "Failed to save content details" },
      { status: 500 }
    );
  }
}
