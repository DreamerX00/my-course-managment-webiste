import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

// Generate a secure invitation token
export function generateInvitationToken(): string {
  return randomBytes(32).toString('hex');
}

// Create an invitation record
export async function createInvitation(
  email: string,
  role: UserRole,
  courseId: string | null,
  message: string | null,
  invitedBy: string
) {
  const token = generateInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const invitation = await db.invitation.create({
    data: {
      email,
      token,
      role,
      courseId,
      message,
      expiresAt,
      invitedBy,
    },
  });

  return invitation;
}

// Validate an invitation token
export async function validateInvitationToken(token: string) {
  const invitation = await db.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return { valid: false, error: 'Invalid invitation token' };
  }

  if (invitation.used) {
    return { valid: false, error: 'Invitation has already been used' };
  }

  if (invitation.expiresAt < new Date()) {
    return { valid: false, error: 'Invitation has expired' };
  }

  return { valid: true, invitation };
}

// Mark invitation as used
export async function markInvitationAsUsed(token: string) {
  await db.invitation.update({
    where: { token },
    data: { used: true },
  });
}

// Get course name by ID
export async function getCourseName(courseId: string | null): Promise<string | null> {
  if (!courseId) return null;
  
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });
    return course?.title || null;
  } catch (error) {
    console.error('Error fetching course name:', error);
    return null;
  }
}

// Get invitation statistics
export async function getInvitationStats() {
  const totalInvitations = await db.invitation.count();
  const usedInvitations = await db.invitation.count({ where: { used: true } });
  const pendingInvitations = await db.invitation.count({ where: { used: false } });
  const expiredInvitations = await db.invitation.count({
    where: {
      expiresAt: { lt: new Date() },
      used: false,
    },
  });

  return {
    total: totalInvitations,
    used: usedInvitations,
    pending: pendingInvitations,
    expired: expiredInvitations,
  };
} 