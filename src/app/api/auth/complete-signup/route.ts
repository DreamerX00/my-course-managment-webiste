import { NextRequest, NextResponse } from 'next/server';
import { validateInvitationToken, markInvitationAsUsed } from '@/lib/invitation';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token || !name || !password) {
      return NextResponse.json({ 
        error: 'Token, name, and password are required' 
      }, { status: 400 });
    }

    // Validate invitation token
    const validation = await validateInvitationToken(token);

    if (!validation.valid || !validation.invitation) {
      return NextResponse.json({ error: validation.error || 'Invalid invitation' }, { status: 400 });
    }

    const { invitation } = validation;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        email: invitation.email,
        name,
        password: hashedPassword,
        role: invitation.role,
        status: 'ACTIVE',
      },
    });

    // Enroll in course if specified
    if (invitation.courseId) {
      await db.user.update({
        where: { id: user.id },
        data: {
          courses: {
            connect: { id: invitation.courseId },
          },
        },
      });
    }

    // Mark invitation as used
    await markInvitationAsUsed(token);

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[COMPLETE_SIGNUP_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 