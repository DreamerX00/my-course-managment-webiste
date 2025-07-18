import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { use } from 'react';

export async function GET(req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { courseId, chapterId } = await context.params;
  try {
    const lessons = await db.lesson.findMany({
      where: { chapterId },
      orderBy: { position: 'asc' },
    });
    return NextResponse.json(lessons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { courseId, chapterId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { title, content, videoUrl } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Find the next position for the lesson
    const count = await db.lesson.count({ where: { chapterId } });
    const lesson = await db.lesson.create({
      data: {
        title,
        content,
        videoUrl,
        chapterId,
        position: count + 1,
      },
    });
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
} 