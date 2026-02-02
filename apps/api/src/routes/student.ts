/**
 * Student Routes
 * 
 * Endpoints for student profile management, progress tracking,
 * and knowledge graph operations.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma, LearningStyle } from '@eduforge/database';

export const studentRoutes = new Hono();

// Validation schemas
const updateProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional(),
  gradeLevel: z.number().int().min(1).max(12).optional(),
  learningStyle: z.enum(['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MIXED']).optional(),
  nativeLanguage: z.string().min(2).max(5).optional(),
  targetLanguage: z.string().min(2).max(5).optional().nullable(),
  specialNeeds: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  dailyGoalMinutes: z.number().int().min(5).max(480).optional(),
});

const enrollSchema = z.object({
  curriculumId: z.string(),
  targetExamDate: z.string().datetime().optional(),
});

/**
 * GET /student/profile - Get student profile
 */
studentRoutes.get('/profile', async (c) => {
  const user = c.get('user');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: {
      enrollments: {
        include: {
          curriculum: {
            include: {
              examBoard: true,
            },
          },
        },
      },
      _count: {
        select: {
          knowledgeNodes: true,
          learningSessions: true,
          assessments: true,
        },
      },
    },
  });

  if (!profile) {
    return c.json({ error: 'Student profile not found' }, 404);
  }

  return c.json({ profile });
});

/**
 * PUT /student/profile - Update student profile
 */
studentRoutes.put('/profile', zValidator('json', updateProfileSchema), async (c) => {
  const user = c.get('user');
  const updates = c.req.valid('json');

  const profile = await prisma.studentProfile.update({
    where: { userId: user.id },
    data: {
      ...updates,
      dateOfBirth: updates.dateOfBirth ? new Date(updates.dateOfBirth) : undefined,
      learningStyle: updates.learningStyle as LearningStyle,
    },
  });

  return c.json({ profile });
});

/**
 * POST /student/enroll - Enroll in a curriculum
 */
studentRoutes.post('/enroll', zValidator('json', enrollSchema), async (c) => {
  const user = c.get('user');
  const { curriculumId, targetExamDate } = c.req.valid('json');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return c.json({ error: 'Student profile not found' }, 404);
  }

  // Verify curriculum exists
  const curriculum = await prisma.curriculum.findUnique({
    where: { id: curriculumId },
  });

  if (!curriculum) {
    return c.json({ error: 'Curriculum not found' }, 404);
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.curriculumEnrollment.findUnique({
    where: {
      studentId_curriculumId: {
        studentId: profile.id,
        curriculumId,
      },
    },
  });

  if (existingEnrollment) {
    return c.json({ error: 'Already enrolled in this curriculum' }, 400);
  }

  const enrollment = await prisma.curriculumEnrollment.create({
    data: {
      studentId: profile.id,
      curriculumId,
      targetExamDate: targetExamDate ? new Date(targetExamDate) : undefined,
    },
    include: {
      curriculum: {
        include: {
          examBoard: true,
        },
      },
    },
  });

  return c.json({ enrollment }, 201);
});

/**
 * DELETE /student/enroll/:curriculumId - Unenroll from a curriculum
 */
studentRoutes.delete('/enroll/:curriculumId', async (c) => {
  const user = c.get('user');
  const curriculumId = c.req.param('curriculumId');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return c.json({ error: 'Student profile not found' }, 404);
  }

  await prisma.curriculumEnrollment.delete({
    where: {
      studentId_curriculumId: {
        studentId: profile.id,
        curriculumId,
      },
    },
  });

  return c.json({ success: true });
});

/**
 * GET /student/knowledge - Get knowledge graph
 */
studentRoutes.get('/knowledge', async (c) => {
  const user = c.get('user');
  const topicId = c.req.query('topicId');
  const curriculumId = c.req.query('curriculumId');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return c.json({ error: 'Student profile not found' }, 404);
  }

  const whereClause: Record<string, unknown> = {
    studentId: profile.id,
  };

  if (topicId) {
    whereClause.concept = { topicId };
  }

  if (curriculumId) {
    whereClause.concept = {
      ...whereClause.concept as object,
      topic: {
        unit: {
          curriculumId,
        },
      },
    };
  }

  const knowledgeNodes = await prisma.knowledgeNode.findMany({
    where: whereClause,
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
    orderBy: { updatedAt: 'desc' },
  });

  // Calculate summary statistics
  const totalNodes = knowledgeNodes.length;
  const avgMastery = totalNodes > 0
    ? knowledgeNodes.reduce((sum, kn) => sum + kn.masteryLevel, 0) / totalNodes
    : 0;
  const masteredCount = knowledgeNodes.filter(kn => kn.masteryLevel >= 0.8).length;
  const needsReview = knowledgeNodes.filter(kn => 
    kn.nextReviewDate && kn.nextReviewDate <= new Date()
  ).length;

  return c.json({
    knowledgeNodes,
    summary: {
      totalNodes,
      avgMastery: Math.round(avgMastery * 100) / 100,
      masteredCount,
      needsReview,
    },
  });
});

/**
 * GET /student/progress - Get learning progress
 */
studentRoutes.get('/progress', async (c) => {
  const user = c.get('user');
  const period = c.req.query('period') || '7d'; // 7d, 30d, all

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return c.json({ error: 'Student profile not found' }, 404);
  }

  // Calculate date range
  let startDate: Date | undefined;
  if (period === '7d') {
    startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '30d') {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get session stats
  const sessions = await prisma.learningSession.findMany({
    where: {
      studentId: profile.id,
      startedAt: startDate ? { gte: startDate } : undefined,
    },
    select: {
      startedAt: true,
      durationMinutes: true,
      mode: true,
    },
  });

  // Get assessment stats
  const assessments = await prisma.assessment.findMany({
    where: {
      studentId: profile.id,
      completedAt: startDate ? { gte: startDate } : undefined,
    },
    select: {
      score: true,
      maxScore: true,
      completedAt: true,
    },
  });

  // Calculate metrics
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalSessions = sessions.length;
  const avgSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;

  const avgScore = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + ((a.score || 0) / (a.maxScore || 1)), 0) / assessments.length
    : 0;

  // Daily breakdown
  const dailyStats = new Map<string, { minutes: number; sessions: number }>();
  for (const session of sessions) {
    const date = session.startedAt.toISOString().split('T')[0];
    const existing = dailyStats.get(date) || { minutes: 0, sessions: 0 };
    existing.minutes += session.durationMinutes || 0;
    existing.sessions += 1;
    dailyStats.set(date, existing);
  }

  return c.json({
    period,
    summary: {
      totalMinutes,
      totalSessions,
      avgSessionLength: Math.round(avgSessionLength),
      totalAssessments: assessments.length,
      avgScore: Math.round(avgScore * 100),
      dailyGoal: profile.dailyGoalMinutes,
    },
    daily: Object.fromEntries(dailyStats),
  });
});

/**
 * GET /student/streak - Get learning streak
 */
studentRoutes.get('/streak', async (c) => {
  const user = c.get('user');

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return c.json({ error: 'Student profile not found' }, 404);
  }

  // Get recent sessions
  const sessions = await prisma.learningSession.findMany({
    where: {
      studentId: profile.id,
      durationMinutes: { gte: 5 }, // At least 5 minutes to count
    },
    orderBy: { startedAt: 'desc' },
    take: 365, // Last year
    select: {
      startedAt: true,
    },
  });

  // Calculate streak
  const sessionDates = new Set(
    sessions.map(s => s.startedAt.toISOString().split('T')[0])
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date().toISOString().split('T')[0];

  // Check if studied today
  if (sessionDates.has(today)) {
    currentStreak = 1;
  }

  // Count consecutive days
  for (let i = 1; i <= 365; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    if (sessionDates.has(date)) {
      if (currentStreak > 0 || i === 1) {
        currentStreak++;
      }
      tempStreak++;
    } else {
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      tempStreak = 0;
      if (currentStreak > 0) {
        break;
      }
    }
  }

  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  return c.json({
    currentStreak,
    longestStreak,
    studiedToday: sessionDates.has(today),
  });
});
