/**
 * Curriculum Routes
 * 
 * Endpoints for browsing and searching curriculum content.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@eduforge/database';

export const curriculumRoutes = new Hono();

/**
 * GET /curriculum/exam-boards - List all exam boards
 */
curriculumRoutes.get('/exam-boards', async (c) => {
  const examBoards = await prisma.examBoard.findMany({
    include: {
      _count: {
        select: { curricula: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return c.json({ examBoards });
});

/**
 * GET /curriculum/search - Search curricula
 */
curriculumRoutes.get('/search', zValidator('query', z.object({
  q: z.string().optional(),
  examBoard: z.string().optional(),
  subject: z.string().optional(),
  yearGroup: z.string().optional(),
})), async (c) => {
  const { q, examBoard, subject, yearGroup } = c.req.valid('query');

  const whereClause: Record<string, unknown> = {};

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { subject: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (examBoard) {
    whereClause.examBoard = { name: examBoard };
  }

  if (subject) {
    whereClause.subject = { contains: subject, mode: 'insensitive' };
  }

  if (yearGroup) {
    whereClause.yearGroup = yearGroup;
  }

  const curricula = await prisma.curriculum.findMany({
    where: whereClause,
    include: {
      examBoard: true,
      _count: {
        select: { units: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return c.json({ curricula });
});

/**
 * GET /curriculum/:id - Get curriculum details
 */
curriculumRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');

  const curriculum = await prisma.curriculum.findUnique({
    where: { id },
    include: {
      examBoard: true,
      units: {
        include: {
          topics: {
            include: {
              _count: {
                select: { concepts: true },
              },
            },
            orderBy: { sequenceOrder: 'asc' },
          },
        },
        orderBy: { sequenceOrder: 'asc' },
      },
    },
  });

  if (!curriculum) {
    return c.json({ error: 'Curriculum not found' }, 404);
  }

  return c.json({ curriculum });
});

/**
 * GET /curriculum/:id/topics - Get topics for a curriculum
 */
curriculumRoutes.get('/:id/topics', async (c) => {
  const id = c.req.param('id');

  const topics = await prisma.topic.findMany({
    where: {
      unit: {
        curriculumId: id,
      },
    },
    include: {
      unit: true,
      learningObjectives: true,
      _count: {
        select: { concepts: true },
      },
    },
    orderBy: [
      { unit: { sequenceOrder: 'asc' } },
      { sequenceOrder: 'asc' },
    ],
  });

  return c.json({ topics });
});

/**
 * GET /curriculum/topic/:id - Get topic details
 */
curriculumRoutes.get('/topic/:id', async (c) => {
  const id = c.req.param('id');

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      unit: {
        include: {
          curriculum: {
            include: {
              examBoard: true,
            },
          },
        },
      },
      concepts: {
        include: {
          prerequisites: true,
          _count: {
            select: { questions: true },
          },
        },
        orderBy: { difficulty: 'asc' },
      },
      learningObjectives: {
        orderBy: { code: 'asc' },
      },
    },
  });

  if (!topic) {
    return c.json({ error: 'Topic not found' }, 404);
  }

  return c.json({ topic });
});

/**
 * GET /curriculum/concept/:id - Get concept details
 */
curriculumRoutes.get('/concept/:id', async (c) => {
  const id = c.req.param('id');

  const concept = await prisma.concept.findUnique({
    where: { id },
    include: {
      topic: {
        include: {
          unit: {
            include: {
              curriculum: {
                include: {
                  examBoard: true,
                },
              },
            },
          },
        },
      },
      prerequisites: true,
      dependents: true,
      contentChunks: {
        orderBy: { contentType: 'asc' },
      },
    },
  });

  if (!concept) {
    return c.json({ error: 'Concept not found' }, 404);
  }

  return c.json({ concept });
});

/**
 * GET /curriculum/:id/exam-papers - Get exam papers for a curriculum
 */
curriculumRoutes.get('/:id/exam-papers', async (c) => {
  const id = c.req.param('id');

  const examPapers = await prisma.examPaper.findMany({
    where: { curriculumId: id },
    include: {
      _count: {
        select: { questions: true },
      },
    },
    orderBy: [
      { year: 'desc' },
      { session: 'asc' },
    ],
  });

  return c.json({ examPapers });
});

/**
 * GET /curriculum/exam-paper/:id - Get exam paper details
 */
curriculumRoutes.get('/exam-paper/:id', async (c) => {
  const id = c.req.param('id');

  const examPaper = await prisma.examPaper.findUnique({
    where: { id },
    include: {
      curriculum: {
        include: {
          examBoard: true,
        },
      },
      questions: {
        include: {
          concept: true,
        },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!examPaper) {
    return c.json({ error: 'Exam paper not found' }, 404);
  }

  return c.json({ examPaper });
});

/**
 * GET /curriculum/career-tracks - List career tracks
 */
curriculumRoutes.get('/career-tracks', async (c) => {
  const tracks = await prisma.careerTrack.findMany({
    include: {
      skills: {
        orderBy: { sequenceOrder: 'asc' },
      },
      _count: {
        select: { projects: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return c.json({ tracks });
});

/**
 * GET /curriculum/career-track/:id - Get career track details
 */
curriculumRoutes.get('/career-track/:id', async (c) => {
  const id = c.req.param('id');

  const track = await prisma.careerTrack.findUnique({
    where: { id },
    include: {
      skills: {
        orderBy: { sequenceOrder: 'asc' },
      },
      projects: {
        orderBy: { difficulty: 'asc' },
      },
    },
  });

  if (!track) {
    return c.json({ error: 'Career track not found' }, 404);
  }

  return c.json({ track });
});
