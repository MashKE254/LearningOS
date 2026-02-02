/**
 * Admin Routes
 * 
 * Platform administration, content management, and analytics.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@eduforge/database';

export const adminRoutes = new Hono();

// Admin authorization middleware
const requireAdmin = async (c: any, next: any) => {
  const user = c.get('user');
  if (user.role !== 'ADMIN') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
};

adminRoutes.use('*', requireAdmin);

/**
 * GET /admin/stats - Platform statistics
 */
adminRoutes.get('/stats', async (c) => {
  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    totalSessions,
    totalInteractions,
    activeToday,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
    prisma.learningSession.count(),
    prisma.interaction.count(),
    prisma.learningSession.count({
      where: {
        startedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  // Get recent signup trend (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSignups = await prisma.user.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: sevenDaysAgo } },
    _count: true,
  });

  // AI usage stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayInteractions = await prisma.interaction.findMany({
    where: {
      createdAt: { gte: todayStart },
      modelUsed: { not: null },
    },
    select: {
      modelUsed: true,
      tokensUsed: true,
    },
  });

  const modelUsage: Record<string, { count: number; tokens: number }> = {};
  for (const interaction of todayInteractions) {
    const model = interaction.modelUsed || 'unknown';
    if (!modelUsage[model]) {
      modelUsage[model] = { count: 0, tokens: 0 };
    }
    modelUsage[model].count++;
    modelUsage[model].tokens += interaction.tokensUsed || 0;
  }

  return c.json({
    users: {
      total: totalUsers,
      students: totalStudents,
      teachers: totalTeachers,
    },
    activity: {
      totalSessions,
      totalInteractions,
      activeToday,
    },
    ai: {
      interactionsToday: todayInteractions.length,
      modelUsage,
    },
    growth: {
      signupsLast7Days: recentSignups.length,
    },
  });
});

/**
 * GET /admin/users - List users with pagination
 */
adminRoutes.get('/users', zValidator('query', z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']).optional(),
  search: z.string().optional(),
})), async (c) => {
  const { page, limit, role, search } = c.req.valid('query');
  const offset = (page - 1) * limit;

  const whereClause: Record<string, unknown> = {};
  if (role) whereClause.role = role;
  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        subscription: {
          select: { tier: true, status: true },
        },
      },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return c.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * PUT /admin/user/:id - Update user
 */
adminRoutes.put('/user/:id', zValidator('json', z.object({
  name: z.string().optional(),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
})), async (c) => {
  const userId = c.req.param('id');
  const updates = c.req.valid('json');

  const user = await prisma.user.update({
    where: { id: userId },
    data: updates,
  });

  return c.json({ user });
});

/**
 * DELETE /admin/user/:id - Delete user (soft delete)
 */
adminRoutes.delete('/user/:id', async (c) => {
  const userId = c.req.param('id');

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return c.json({ success: true });
});

/**
 * GET /admin/curricula - List all curricula
 */
adminRoutes.get('/curricula', async (c) => {
  const curricula = await prisma.curriculum.findMany({
    include: {
      examBoard: true,
      _count: {
        select: {
          units: true,
          enrollments: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return c.json({ curricula });
});

/**
 * POST /admin/curriculum - Create curriculum
 */
adminRoutes.post('/curriculum', zValidator('json', z.object({
  name: z.string().min(1),
  examBoardId: z.string(),
  subject: z.string(),
  yearGroup: z.string().optional(),
  description: z.string().optional(),
  syllabusUrl: z.string().url().optional(),
})), async (c) => {
  const data = c.req.valid('json');

  const curriculum = await prisma.curriculum.create({
    data,
    include: { examBoard: true },
  });

  return c.json({ curriculum }, 201);
});

/**
 * POST /admin/exam-board - Create exam board
 */
adminRoutes.post('/exam-board', zValidator('json', z.object({
  name: z.string().min(1),
  country: z.string(),
  region: z.string().optional(),
  website: z.string().url().optional(),
})), async (c) => {
  const data = c.req.valid('json');

  const examBoard = await prisma.examBoard.create({ data });

  return c.json({ examBoard }, 201);
});

/**
 * GET /admin/institutions - List institutions
 */
adminRoutes.get('/institutions', async (c) => {
  const institutions = await prisma.institution.findMany({
    include: {
      _count: {
        select: {
          teachers: true,
          classes: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return c.json({ institutions });
});

/**
 * POST /admin/institution - Create institution
 */
adminRoutes.post('/institution', zValidator('json', z.object({
  name: z.string().min(1),
  type: z.enum(['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TUTORING_CENTER', 'HOMESCHOOL_GROUP']),
  country: z.string(),
  region: z.string().optional(),
  contactEmail: z.string().email(),
  maxStudents: z.number().int().min(1).optional(),
})), async (c) => {
  const data = c.req.valid('json');

  const institution = await prisma.institution.create({ data });

  return c.json({ institution }, 201);
});

/**
 * GET /admin/subscriptions - Subscription analytics
 */
adminRoutes.get('/subscriptions', async (c) => {
  const subscriptions = await prisma.subscription.groupBy({
    by: ['tier', 'status'],
    _count: true,
  });

  const mrr = await prisma.subscription.aggregate({
    where: {
      status: 'ACTIVE',
      tier: { not: 'FREE' },
    },
    _count: true,
  });

  // Price mapping (in cents)
  const prices: Record<string, number> = {
    STUDENT_PRO: 2900,
    FAMILY_PRO: 7900,
    INSTITUTION: 1400, // per student/year
  };

  return c.json({
    breakdown: subscriptions,
    activeSubscriptions: mrr._count,
    // Note: Real MRR calculation would need actual subscription amounts
  });
});

/**
 * GET /admin/ai-costs - AI cost tracking
 */
adminRoutes.get('/ai-costs', zValidator('query', z.object({
  period: z.enum(['day', 'week', 'month']).default('week'),
})), async (c) => {
  const { period } = c.req.valid('query');

  let startDate: Date;
  switch (period) {
    case 'day':
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  const interactions = await prisma.interaction.findMany({
    where: {
      createdAt: { gte: startDate },
      modelUsed: { not: null },
    },
    select: {
      modelUsed: true,
      tokensUsed: true,
      createdAt: true,
    },
  });

  // Cost calculation (per million tokens)
  const costs: Record<string, { input: number; output: number }> = {
    haiku: { input: 0.25, output: 1.25 },
    sonnet: { input: 3, output: 15 },
    opus: { input: 15, output: 75 },
  };

  const modelStats: Record<string, { count: number; tokens: number; estimatedCost: number }> = {};
  let totalCost = 0;

  for (const interaction of interactions) {
    const model = interaction.modelUsed || 'unknown';
    if (!modelStats[model]) {
      modelStats[model] = { count: 0, tokens: 0, estimatedCost: 0 };
    }
    modelStats[model].count++;
    modelStats[model].tokens += interaction.tokensUsed || 0;
    
    // Estimate cost (assuming 50/50 input/output split)
    const modelCost = costs[model];
    if (modelCost && interaction.tokensUsed) {
      const cost = (interaction.tokensUsed / 1000000) * 
        ((modelCost.input + modelCost.output) / 2);
      modelStats[model].estimatedCost += cost;
      totalCost += cost;
    }
  }

  return c.json({
    period,
    totalInteractions: interactions.length,
    totalTokens: interactions.reduce((sum, i) => sum + (i.tokensUsed || 0), 0),
    estimatedCost: Math.round(totalCost * 100) / 100,
    byModel: modelStats,
  });
});

/**
 * POST /admin/content/ingest - Trigger content ingestion
 */
adminRoutes.post('/content/ingest', zValidator('json', z.object({
  curriculumId: z.string(),
  sourceUrl: z.string().url().optional(),
  sourceType: z.enum(['SYLLABUS', 'TEXTBOOK', 'EXAM_PAPER', 'MARKING_SCHEME']),
})), async (c) => {
  const { curriculumId, sourceUrl, sourceType } = c.req.valid('json');

  // In production, this would trigger a background job
  // to fetch, process, and vectorize the content

  return c.json({
    message: 'Content ingestion job queued',
    jobId: `ingest-${Date.now()}`,
    curriculumId,
    sourceType,
    sourceUrl,
  }, 202);
});

/**
 * GET /admin/metrics/daily - Get daily metrics
 */
adminRoutes.get('/metrics/daily', zValidator('query', z.object({
  days: z.string().transform(Number).default('7'),
})), async (c) => {
  const { days } = c.req.valid('query');
  
  const metrics = await prisma.dailyMetrics.findMany({
    where: {
      date: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    },
    orderBy: { date: 'desc' },
  });

  return c.json({ metrics });
});
