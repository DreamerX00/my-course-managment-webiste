import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { chapterIds } = await req.json(); // array of chapter IDs in new order
    if (!Array.isArray(chapterIds)) {
      return NextResponse.json({ error: 'Invalid chapterIds' }, { status: 400 });
    }
    for (let i = 0; i < chapterIds.length; i++) {
      await db.chapter.update({ where: { id: chapterIds[i], courseId }, data: { position: i + 1 } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder chapters:', error);
    return NextResponse.json({ error: 'Failed to reorder chapters' }, { status: 500 });
  }
} 