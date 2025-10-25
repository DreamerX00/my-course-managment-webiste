import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Get platform settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== UserRole.OWNER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let settings = await db.platformSettings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      settings = await db.platformSettings.create({
        data: { id: 'global' },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('[PLATFORM_SETTINGS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Update platform settings
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== UserRole.OWNER) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      enableTwoFactorAuth,
      disablePublicSignups,
      lockPlatformInviteOnly,
      enableAuditLogs,
    } = body;

    const updatedSettings = await db.platformSettings.update({
      where: { id: 'global' },
      data: {
        enableTwoFactorAuth,
        disablePublicSignups,
        lockPlatformInviteOnly,
        enableAuditLogs,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('[PLATFORM_SETTINGS_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 