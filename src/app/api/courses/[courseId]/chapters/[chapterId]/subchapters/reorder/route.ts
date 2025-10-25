import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

export async function POST(req: NextRequest, context: { params: Promise<{ courseId: string, chapterId: string }> }) {
  const { chapterId } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'INSTRUCTOR', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { subchapterIds } = await req.json(); // array of subchapter IDs in new order
    if (!Array.isArray(subchapterIds)) {
      return NextResponse.json({ error: 'Invalid subchapterIds' }, { status: 400 });
    }
    for (let i = 0; i < subchapterIds.length; i++) {
      await db.subchapter.update({ where: { id: subchapterIds[i], chapterId }, data: { position: i + 1 } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder subchapters:', error);
    return NextResponse.json({ error: 'Failed to reorder subchapters' }, { status: 500 });
  }
} 