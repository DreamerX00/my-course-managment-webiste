import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { chapterId } = await context.params;
  try {
    const subchapters = await db.subchapter.findMany({
      where: { chapterId },
      orderBy: { position: 'asc' },
    });
    return NextResponse.json(subchapters);
  } catch (error) {
    console.error('Failed to fetch subchapters:', error);
    return NextResponse.json({ error: 'Failed to fetch subchapters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { chapterId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { title, content, videoUrl } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Find the next position for the subchapter
    const count = await db.subchapter.count({ where: { chapterId } });
    const subchapter = await db.subchapter.create({
      data: {
        title,
        content,
        videoUrl,
        chapterId,
        position: count + 1,
      },
    });
    return NextResponse.json(subchapter, { status: 201 });
  } catch (error) {
    console.error('Failed to create subchapter:', error);
    return NextResponse.json({ error: 'Failed to create subchapter' }, { status: 500 });
  }
} 