import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

interface ChapterUpdateData {
  title?: string;
  content?: string;
  videoUrl?: string | null;
  isFree?: boolean;
  position?: number;
}

export async function GET(_req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { courseId, chapterId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId, courseId },
    });
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to fetch chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch chapter' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { courseId, chapterId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const { title, content, videoUrl, isFree, position } = data;
    const updateData: ChapterUpdateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (isFree !== undefined) updateData.isFree = isFree;
    if (position !== undefined) updateData.position = position;
    const chapter = await db.chapter.update({
      where: { id: chapterId, courseId },
      data: updateData,
    });
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Failed to update chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { courseId, chapterId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await db.chapter.delete({ where: { id: chapterId, courseId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
} 