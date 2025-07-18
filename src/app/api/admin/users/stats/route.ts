import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { UserRole, UserStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== UserRole.OWNER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const totalUsers = await db.user.count();
    const admins = await db.user.count({ where: { role: UserRole.ADMIN } });
    const instructors = await db.user.count({ where: { role: UserRole.INSTRUCTOR } });
    const students = await db.user.count({ where: { role: UserRole.STUDENT } });
    const blocked = await db.user.count({ where: { status: UserStatus.BLOCKED } });

    const response = {
      totalUsers,
      admins,
      instructors,
      students: students || 0,
      blocked,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[USERS_STATS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 