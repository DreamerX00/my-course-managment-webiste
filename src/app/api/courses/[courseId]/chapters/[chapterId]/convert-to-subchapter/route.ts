import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await context.params;
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !["ADMIN", "INSTRUCTOR", "OWNER"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { parentChapterId } = await req.json();

    if (!parentChapterId) {
      return NextResponse.json(
        { error: "Parent chapter ID is required" },
        { status: 400 }
      );
    }

    // Verify parent chapter exists and belongs to the same course
    const parentChapter = await db.chapter.findFirst({
      where: {
        id: parentChapterId,
        courseId: courseId,
      },
    });

    if (!parentChapter) {
      return NextResponse.json(
        { error: "Parent chapter not found" },
        { status: 404 }
      );
    }

    // Get the chapter to convert
    const chapterToConvert = await db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    if (!chapterToConvert) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Get the max position of existing subchapters
    const maxPosition = await db.subchapter.aggregate({
      where: {
        chapterId: parentChapterId,
      },
      _max: {
        position: true,
      },
    });

    const newPosition = (maxPosition._max.position || 0) + 1;

    // Create a subchapter from the chapter
    const newSubchapter = await db.subchapter.create({
      data: {
        title: chapterToConvert.title,
        content: chapterToConvert.content,
        videoUrl: chapterToConvert.videoUrl,
        position: newPosition,
        chapterId: parentChapterId,
      },
    });

    // Delete the original chapter
    await db.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    return NextResponse.json({
      success: true,
      subchapter: newSubchapter,
      message: "Chapter converted to subchapter successfully",
    });
  } catch (error) {
    console.error("Error converting chapter to subchapter:", error);
    return NextResponse.json(
      { error: "Failed to convert chapter to subchapter" },
      { status: 500 }
    );
  }
}
