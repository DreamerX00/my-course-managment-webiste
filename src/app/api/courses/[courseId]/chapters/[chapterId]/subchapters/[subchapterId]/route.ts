import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

interface SubchapterUpdateData {
  title?: string;
  content?: string;
  videoUrl?: string | null;
  position?: number;
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string, subchapterId: string }> }) {
  const { chapterId, subchapterId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    const { title, content, videoUrl, position } = data;
    const updateData: SubchapterUpdateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (position !== undefined) updateData.position = position;
    const subchapter = await db.subchapter.update({
      where: { id: subchapterId, chapterId },
      data: updateData,
    });
    return NextResponse.json(subchapter);
  } catch (error) {
    console.error('Failed to update subchapter:', error);
    return NextResponse.json({ error: 'Failed to update subchapter' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string, subchapterId: string }> }) {
  const { chapterId, subchapterId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await db.subchapter.delete({ where: { id: subchapterId, chapterId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete subchapter:', error);
    return NextResponse.json({ error: 'Failed to delete subchapter' }, { status: 500 });
  }
} 