import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  try {
    const chapters = await db.chapter.findMany({
      where: { courseId },
      orderBy: { position: 'asc' },
    });
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Failed to fetch chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { title, content } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Find the next position for the chapter
    const count = await db.chapter.count({ where: { courseId } });
    const chapter = await db.chapter.create({
      data: {
        title,
        content,
        courseId,
        position: count + 1,
      },
    });
    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Failed to create chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
} 