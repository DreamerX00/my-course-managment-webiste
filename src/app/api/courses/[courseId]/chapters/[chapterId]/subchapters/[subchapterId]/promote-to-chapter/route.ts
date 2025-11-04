import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      courseId: string;
      chapterId: string;
      subchapterId: string;
    }>;
  }
) {
  const { courseId, chapterId, subchapterId } = await context.params;
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !["ADMIN", "INSTRUCTOR", "OWNER"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the subchapter to convert
    const subchapterToConvert = await db.subchapter.findFirst({
      where: {
        id: subchapterId,
        chapterId: chapterId,
      },
    });

    if (!subchapterToConvert) {
      return NextResponse.json(
        { error: "Subchapter not found" },
        { status: 404 }
      );
    }

    // Get the max position of existing chapters
    const maxPosition = await db.chapter.aggregate({
      where: {
        courseId: courseId,
      },
      _max: {
        position: true,
      },
    });

    const newPosition = (maxPosition._max.position || 0) + 1;

    // Create a chapter from the subchapter
    const newChapter = await db.chapter.create({
      data: {
        title: subchapterToConvert.title,
        content: subchapterToConvert.content,
        videoUrl: subchapterToConvert.videoUrl,
        position: newPosition,
        courseId: courseId,
      },
    });

    // Delete the original subchapter
    await db.subchapter.delete({
      where: {
        id: subchapterId,
      },
    });

    return NextResponse.json({
      success: true,
      chapter: newChapter,
      message: "Subchapter promoted to chapter successfully",
    });
  } catch (error) {
    console.error("Error promoting subchapter to chapter:", error);
    return NextResponse.json(
      { error: "Failed to promote subchapter to chapter" },
      { status: 500 }
    );
  }
}
