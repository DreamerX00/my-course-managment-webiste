import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { UserRole, UserStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== UserRole.OWNER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;
    const body = await req.json();
    const { action, role, status } = body;

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent modifying OWNER users
    if (user.role === UserRole.OWNER) {
      return NextResponse.json({ error: 'Cannot modify OWNER users' }, { status: 403 });
    }

    let updatedUser;

    switch (action) {
      case 'changeRole':
        if (!role || !Object.values(UserRole).includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { role },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      case 'toggleStatus':
        const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
        updatedUser = await db.user.update({
          where: { id: userId },
          data: { status: newStatus },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[USER_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== UserRole.OWNER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting OWNER users
    if (user.role === UserRole.OWNER) {
      return NextResponse.json({ error: 'Cannot delete OWNER users' }, { status: 403 });
    }

    // Delete user (this will cascade to related records)
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[USER_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 