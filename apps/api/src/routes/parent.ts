/**
 * Parent Routes
 * 
 * Dashboard and monitoring endpoints for parents to track their children's progress.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@eduforge/database';

export const parentRoutes = new Hono();

/**
 * GET /parent/profile - Get parent profile with linked students
 */
parentRoutes.get('/profile', async (c) => {
  const user = c.get('user');

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    include: {
      linkedStudents: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
              enrollments: {
                include: {
                  curriculum: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) {
    return c.json({ error: 'Parent profile not found' }, 404);
  }

  return c.json({ profile });
});

/**
 * POST /parent/link-student - Link a student to parent account
 */
parentRoutes.post('/link-student', zValidator('json', z.object({
  studentEmail: z.string().email(),
  relationship: z.enum(['PARENT', 'GUARDIAN', 'TUTOR']).default('PARENT'),
})), async (c) => {
  const user = c.get('user');
  const { studentEmail, relationship } = c.req.valid('json');

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!parentProfile) {
    return c.json({ error: 'Parent profile not found' }, 404);
  }

  // Find student by email
  const studentUser = await prisma.user.findUnique({
    where: { email: studentEmail },
    include: {
      studentProfile: true,
    },
  });

  if (!studentUser?.studentProfile) {
    return c.json({ error: 'Student not found' }, 404);
  }

  // Check if already linked
  const existingLink = await prisma.parentStudentLink.findUnique({
    where: {
      parentId_studentId: {
        parentId: parentProfile.id,
        studentId: studentUser.studentProfile.id,
      },
    },
  });

  if (existingLink) {
    return c.json({ error: 'Student already linked' }, 400);
  }

  // Create link (in production, this would send an approval request to student)
  const link = await prisma.parentStudentLink.create({
    data: {
      parentId: parentProfile.id,
      studentId: studentUser.studentProfile.id,
      relationship,
      canViewProgress: true,
      canReceiveAlerts: true,
      status: 'PENDING', // Student must approve
    },
    include: {
      student: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
  });

  return c.json({ link }, 201);
});

/**
 * DELETE /parent/unlink-student/:studentId - Unlink a student
 */
parentRoutes.delete('/unlink-student/:studentId', async (c) => {
  const user = c.get('user');
  const studentId = c.req.param('studentId');

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!parentProfile) {
    return c.json({ error: 'Parent profile not found' }, 404);
  }

  await prisma.parentStudentLink.delete({
    where: {
      parentId_studentId: {
        parentId: parentProfile.id,
        studentId,
      },
    },
  });

  return c.json({ success: true });
});

/**
 * GET /parent/dashboard/:studentId - Get dashboard data for a linked student
 */
parentRoutes.get('/dashboard/:studentId', async (c) => {
  const user = c.get('user');
  const studentId = c.req.param('studentId');

  // Verify parent has access to this student
  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    include: {
      linkedStudents: {
        where: { studentId, canViewProgress: true, status: 'APPROVED' },
      },
    },
  });

  if (!parentProfile || parentProfile.linkedStudents.length === 0) {
    return c.json({ error: 'Access denied' }, 403);
  }

  // Get student with comprehensive data
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: { name: true, email: true, avatarUrl: true },
      },
      enrollments: {
        include: {
          curriculum: {
            include: { examBoard: true },
          },
        },
      },
    },
  });

  if (!student) {
    return c.json({ error: 'Student not found' }, 404);
  }

  // Get recent sessions (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSessions = await prisma.learningSession.findMany({
    where: {
      studentId,
      startedAt: { gte: sevenDaysAgo },
    },
    orderBy: { startedAt: 'desc' },
    take: 10,
  });

  // Get knowledge summary
  const knowledgeNodes = await prisma.knowledgeNode.findMany({
    where: { studentId },
    include: {
      concept: {
        include: {
          topic: {
            include: {
              unit: true,
            },
          },
        },
      },
    },
  });

  // Calculate mastery metrics
  const totalConcepts = knowledgeNodes.length;
  const avgMastery = totalConcepts > 0
    ? knowledgeNodes.reduce((sum, kn) => sum + kn.masteryLevel, 0) / totalConcepts
    : 0;
  const struggling = knowledgeNodes.filter(kn => kn.masteryLevel < 0.4);
  const mastered = knowledgeNodes.filter(kn => kn.masteryLevel >= 0.8);

  // Get daily study time for the past week
  const dailyStudy: Record<string, number> = {};
  for (const session of recentSessions) {
    const date = session.startedAt.toISOString().split('T')[0];
    dailyStudy[date] = (dailyStudy[date] || 0) + (session.durationMinutes || 0);
  }

  // Calculate streak
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i <= 7; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (dailyStudy[date] && dailyStudy[date] >= 5) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return c.json({
    student: {
      id: student.id,
      name: student.user.name,
      email: student.user.email,
      avatarUrl: student.user.avatarUrl,
      gradeLevel: student.gradeLevel,
      dailyGoal: student.dailyGoalMinutes,
    },
    enrollments: student.enrollments,
    progress: {
      totalConcepts,
      avgMastery: Math.round(avgMastery * 100),
      masteredCount: mastered.length,
      strugglingCount: struggling.length,
    },
    activity: {
      totalMinutesThisWeek: Object.values(dailyStudy).reduce((a, b) => a + b, 0),
      sessionsThisWeek: recentSessions.length,
      currentStreak: streak,
      dailyStudy,
      studiedToday: dailyStudy[today] ? dailyStudy[today] >= 5 : false,
    },
    struggling: struggling.slice(0, 5).map(kn => ({
      concept: kn.concept.name,
      topic: kn.concept.topic.name,
      mastery: Math.round(kn.masteryLevel * 100),
      misconceptions: kn.misconceptions,
    })),
  });
});

/**
 * GET /parent/children - Get all linked children with their stats
 */
parentRoutes.get('/children', async (c) => {
  const user = c.get('user');

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    include: {
      linkedStudents: {
        where: { status: 'APPROVED' },
        include: {
          student: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
              enrollments: {
                include: {
                  curriculum: {
                    include: { examBoard: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!parentProfile) {
    return c.json({ error: 'Parent profile not found' }, 404);
  }

  const children = await Promise.all(
    parentProfile.linkedStudents.map(async (link) => {
      const student = link.student;
      
      // Get knowledge stats
      const knowledgeNodes = await prisma.knowledgeNode.findMany({
        where: { studentId: student.id },
      });
      
      const totalConcepts = knowledgeNodes.length;
      const avgMastery = totalConcepts > 0
        ? knowledgeNodes.reduce((sum, kn) => sum + kn.masteryLevel, 0) / totalConcepts
        : 0;
      const mastered = knowledgeNodes.filter(kn => kn.masteryLevel >= 0.8);
      
      // Get recent sessions
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentSessions = await prisma.learningSession.findMany({
        where: {
          studentId: student.id,
          startedAt: { gte: sevenDaysAgo },
        },
      });
      
      const timeThisWeek = recentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      const totalSessions = await prisma.learningSession.count({
        where: { studentId: student.id },
      });
      
      // Get last session for "last active"
      const lastSession = await prisma.learningSession.findFirst({
        where: { studentId: student.id },
        orderBy: { startedAt: 'desc' },
      });
      
      // Calculate streak
      let streak = 0;
      const dailyActivity: Record<string, boolean> = {};
      for (const session of recentSessions) {
        const date = session.startedAt.toISOString().split('T')[0];
        dailyActivity[date] = true;
      }
      for (let i = 0; i < 30; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (dailyActivity[date]) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Get recent topics
      const recentTopics = await prisma.knowledgeNode.findMany({
        where: { studentId: student.id },
        orderBy: { lastReviewedAt: 'desc' },
        take: 3,
        include: {
          concept: {
            include: { topic: true },
          },
        },
      });

      // Get unread alerts count
      const strugglingCount = knowledgeNodes.filter(kn => kn.masteryLevel < 0.4).length;
      const daysSinceLastSession = lastSession
        ? Math.floor((Date.now() - lastSession.startedAt.getTime()) / (24 * 60 * 60 * 1000))
        : null;
      let alertsCount = 0;
      if (strugglingCount >= 3) alertsCount++;
      if (daysSinceLastSession && daysSinceLastSession >= 2) alertsCount++;

      return {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        grade: student.gradeLevel ? `Grade ${student.gradeLevel}` : 'Not set',
        curriculum: student.enrollments[0]?.curriculum?.name || 'Not enrolled',
        stats: {
          streak,
          timeThisWeek,
          conceptsMastered: mastered.length,
          avgMastery: Math.round(avgMastery * 100),
          lastActive: lastSession
            ? formatTimeAgo(lastSession.startedAt)
            : 'Never',
          totalSessions,
        },
        recentTopics: recentTopics.map(kn => kn.concept.topic.name),
        alerts: alertsCount,
        subscription: {
          plan: 'Free', // Would come from subscription table
          status: 'active',
        },
      };
    })
  );

  return c.json({ children });
});

// Helper function for time ago formatting
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

/**
 * GET /parent/alerts - Get alerts for all linked students
 */
parentRoutes.get('/alerts', async (c) => {
  const user = c.get('user');

  const parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    include: {
      linkedStudents: {
        where: { canReceiveAlerts: true, status: 'APPROVED' },
        include: {
          student: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!parentProfile) {
    return c.json({ error: 'Parent profile not found' }, 404);
  }

  const alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    studentName: string;
    message: string;
    createdAt: Date;
  }> = [];

  // Generate alerts for each linked student
  for (const link of parentProfile.linkedStudents) {
    const studentId = link.studentId;
    const studentName = link.student.user.name;

    // Check for inactivity
    const lastSession = await prisma.learningSession.findFirst({
      where: { studentId },
      orderBy: { startedAt: 'desc' },
    });

    if (lastSession) {
      const daysSinceLastSession = Math.floor(
        (Date.now() - lastSession.startedAt.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysSinceLastSession >= 3) {
        alerts.push({
          type: 'INACTIVITY',
          severity: daysSinceLastSession >= 7 ? 'high' : 'medium',
          studentName,
          message: `${studentName} hasn't studied in ${daysSinceLastSession} days`,
          createdAt: new Date(),
        });
      }
    }

    // Check for struggling concepts
    const strugglingConcepts = await prisma.knowledgeNode.count({
      where: {
        studentId,
        masteryLevel: { lt: 0.3 },
      },
    });

    if (strugglingConcepts >= 3) {
      alerts.push({
        type: 'STRUGGLING',
        severity: 'high',
        studentName,
        message: `${studentName} is struggling with ${strugglingConcepts} concepts`,
        createdAt: new Date(),
      });
    }

    // Check daily goal progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = await prisma.learningSession.findMany({
      where: {
        studentId,
        startedAt: { gte: today },
      },
    });
    const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const dailyGoal = link.student.dailyGoalMinutes;

    if (todayMinutes >= dailyGoal && dailyGoal > 0) {
      alerts.push({
        type: 'GOAL_ACHIEVED',
        severity: 'low',
        studentName,
        message: `${studentName} completed their daily goal of ${dailyGoal} minutes!`,
        createdAt: new Date(),
      });
    }
  }

  // Sort by severity and date
  alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return c.json({ alerts });
});

/**
 * PUT /parent/notification-preferences - Update notification preferences
 */
parentRoutes.put('/notification-preferences', zValidator('json', z.object({
  emailAlerts: z.boolean().optional(),
  pushAlerts: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  alertThresholds: z.object({
    inactivityDays: z.number().min(1).max(14).optional(),
    strugglingThreshold: z.number().min(0).max(1).optional(),
  }).optional(),
})), async (c) => {
  const user = c.get('user');
  const preferences = c.req.valid('json');

  const profile = await prisma.parentProfile.update({
    where: { userId: user.id },
    data: {
      notificationPreferences: preferences,
    },
  });

  return c.json({ profile });
});
