import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow Admin, Instructor, and Owner roles
    if (session?.user?.role !== UserRole.ADMIN && session?.user?.role !== UserRole.INSTRUCTOR && session?.user?.role !== UserRole.OWNER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchQuery = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const where = searchQuery ? {
      OR: [
        { name: { contains: searchQuery, mode: 'insensitive' as const } },
        { email: { contains: searchQuery, mode: 'insensitive' as const } },
      ],
    } : {};

    // Get users with course enrollment count
    const users = await db.user.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            courses: true, // Count of courses enrolled
          },
        },
      },
    });

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      coursesEnrolled: user._count.courses,
      lastActive: user.updatedAt.toISOString(),
    }));

    const totalUsers = await db.user.count({ where });

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error('[USER_MANAGEMENT_USERS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 