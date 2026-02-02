/**
 * AI Tutor Routes
 * 
 * Core learning interaction endpoints that power the Socratic tutoring experience.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma, SessionMode } from '@eduforge/database';
import { createEduForgeAI, StudentState } from '@eduforge/ai';

export const tutorRoutes = new Hono();

// Initialize AI stack
const ai = createEduForgeAI();

// Validation schemas
const chatMessageSchema = z.object({
  message: z.string().min(1).max(10000),
  sessionId: z.string().optional(),
  mode: z.enum(['SCHOOL_STUFF', 'LEARN_SOMETHING_NEW', 'EXAM_PREP', 'CAREER_CHANGE']).optional(),
  curriculumId: z.string().optional(),
  topicId: z.string().optional(),
});

const generatePracticeSchema = z.object({
  topicId: z.string(),
  count: z.number().min(1).max(10).default(3),
  difficulty: z.number().min(1).max(5).optional(),
  focusOnMisconceptions: z.boolean().default(false),
});

/**
 * POST /tutor/chat - Send a message to the AI tutor
 */
tutorRoutes.post('/chat', zValidator('json', chatMessageSchema), async (c) => {
  const user = c.get('user');
  const { message, sessionId, mode, curriculumId, topicId } = c.req.valid('json');

  // Get student profile
  const studentProfile = await prisma.studentProfile.findUnique({
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
      knowledgeNodes: {
        where: topicId ? {
          concept: {
            topicId,
          },
        } : undefined,
        include: {
          concept: {
            include: {
              topic: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!studentProfile) {
    return c.json({ error: 'Student profile not found' }, 404);
  }

  // Get or create learning session
  let session;
  if (sessionId) {
    session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        interactions: {
          orderBy: { createdAt: 'asc' },
          take: 20, // Last 20 interactions for context
        },
      },
    });
  }

  if (!session) {
    session = await prisma.learningSession.create({
      data: {
        studentId: studentProfile.id,
        mode: (mode as SessionMode) || 'SCHOOL_STUFF',
        curriculumId,
        topicId,
        modelUsage: {},
      },
      include: {
        interactions: true,
      },
    });
  }

  // Build student state for the AI
  const currentEnrollment = studentProfile.enrollments[0]; // Primary enrollment
  const currentTopic = topicId ? studentProfile.knowledgeNodes.find(
    kn => kn.concept.topicId === topicId
  )?.concept.topic : undefined;

  // Calculate average mastery
  const avgMastery = studentProfile.knowledgeNodes.length > 0
    ? studentProfile.knowledgeNodes.reduce((sum, kn) => sum + kn.masteryLevel, 0) / 
      studentProfile.knowledgeNodes.length
    : 0.5;

  const studentState: StudentState = {
    id: studentProfile.id,
    name: user.name,
    preferredLanguage: studentProfile.nativeLanguage,
    targetLanguage: studentProfile.nativeLanguage !== 'en' ? 'en' : undefined,
    learningStyle: studentProfile.learningStyle.toLowerCase() as StudentState['learningStyle'],
    specialNeeds: studentProfile.specialNeeds,
    currentMastery: avgMastery,
    misconceptions: studentProfile.knowledgeNodes
      .filter(kn => kn.misconceptions && (kn.misconceptions as unknown[]).length > 0)
      .flatMap(kn => (kn.misconceptions as Array<{ concept: string; description: string }>).map(m => ({
        concept: m.concept,
        description: m.description,
        detectedAt: new Date(),
      }))),
    enrolledCurriculum: currentEnrollment ? {
      id: currentEnrollment.curriculum.id,
      name: currentEnrollment.curriculum.name,
      examBoard: currentEnrollment.curriculum.examBoard.name,
    } : undefined,
    currentTopic: currentTopic ? {
      id: currentTopic.id,
      name: currentTopic.name,
    } : undefined,
    emotionalState: 'neutral',
  };

  // Build conversation context
  const conversationContext = {
    history: session.interactions.map(i => ({
      role: i.role as 'user' | 'assistant',
      content: i.content,
      timestamp: i.createdAt,
    })),
    attemptCount: session.interactions.filter(i => i.role === 'user').length,
  };

  // Get AI response
  const startTime = Date.now();
  const response = await ai.socraticEngine.teach(
    message,
    studentState,
    conversationContext
  );
  const latencyMs = Date.now() - startTime;

  // Store user message
  await prisma.interaction.create({
    data: {
      sessionId: session.id,
      role: 'user',
      content: message,
      contentType: 'text',
    },
  });

  // Store AI response
  const assistantInteraction = await prisma.interaction.create({
    data: {
      sessionId: session.id,
      role: 'assistant',
      content: response.content,
      contentType: 'text',
      modelUsed: 'sonnet', // We'll get this from the actual response
      latencyMs,
      citations: response.citations.length > 0 ? response.citations : undefined,
      verified: false,
    },
  });

  // Update knowledge graph if misconception detected
  if (response.detectedMisconception && currentTopic) {
    await prisma.knowledgeNode.upsert({
      where: {
        studentId_conceptId: {
          studentId: studentProfile.id,
          conceptId: currentTopic.id,
        },
      },
      update: {
        misconceptions: {
          push: response.detectedMisconception,
        },
        updatedAt: new Date(),
      },
      create: {
        studentId: studentProfile.id,
        conceptId: currentTopic.id,
        masteryLevel: 0,
        misconceptions: [response.detectedMisconception],
      },
    });
  }

  return c.json({
    response: {
      content: response.content,
      type: response.responseType,
      citations: response.citations,
      languageUsed: response.languageUsed,
      confidenceCheck: response.confidenceCheck,
    },
    session: {
      id: session.id,
      mode: session.mode,
    },
    interaction: {
      id: assistantInteraction.id,
      latencyMs,
    },
  });
});

/**
 * POST /tutor/practice - Generate practice problems
 */
tutorRoutes.post('/practice', zValidator('json', generatePracticeSchema), async (c) => {
  const user = c.get('user');
  const { topicId, count, difficulty, focusOnMisconceptions } = c.req.valid('json');

  // Get student profile with knowledge state
  const studentProfile = await prisma.studentProfile.findUnique({
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
      knowledgeNodes: {
        where: {
          concept: {
            topicId,
          },
        },
      },
    },
  });

  if (!studentProfile) {
    return c.json({ error: 'Student profile not found' }, 404);
  }

  // Get topic details
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
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
  });

  if (!topic) {
    return c.json({ error: 'Topic not found' }, 404);
  }

  // Calculate average mastery for this topic
  const avgMastery = studentProfile.knowledgeNodes.length > 0
    ? studentProfile.knowledgeNodes.reduce((sum, kn) => sum + kn.masteryLevel, 0) / 
      studentProfile.knowledgeNodes.length
    : 0.5;

  // Build student state
  const studentState: StudentState = {
    id: studentProfile.id,
    name: user.name,
    preferredLanguage: studentProfile.nativeLanguage,
    learningStyle: studentProfile.learningStyle.toLowerCase() as StudentState['learningStyle'],
    specialNeeds: studentProfile.specialNeeds,
    currentMastery: avgMastery,
    misconceptions: studentProfile.knowledgeNodes
      .filter(kn => kn.misconceptions && (kn.misconceptions as unknown[]).length > 0)
      .flatMap(kn => (kn.misconceptions as Array<{ concept: string; description: string }>).map(m => ({
        concept: m.concept,
        description: m.description,
        detectedAt: new Date(),
      }))),
    enrolledCurriculum: {
      id: topic.unit.curriculum.id,
      name: topic.unit.curriculum.name,
      examBoard: topic.unit.curriculum.examBoard.name,
    },
    currentTopic: {
      id: topic.id,
      name: topic.name,
    },
    emotionalState: 'neutral',
  };

  // Generate practice problems
  const problems = await ai.socraticEngine.generatePractice(studentState, {
    count,
    difficulty: difficulty || Math.ceil(avgMastery * 5),
    focusOnMisconceptions,
  });

  return c.json({
    problems,
    topic: {
      id: topic.id,
      name: topic.name,
    },
    difficulty: difficulty || Math.ceil(avgMastery * 5),
  });
});

/**
 * POST /tutor/verify - Verify student's work
 */
tutorRoutes.post('/verify', zValidator('json', z.object({
  content: z.string(),
  type: z.enum(['MATH', 'CHEMISTRY', 'CODE']),
})), async (c) => {
  const { content, type } = c.req.valid('json');

  const result = await ai.verificationEngine.verify(content, type);

  return c.json({
    verified: result.verified,
    method: result.method,
    result: result.result,
    confidence: result.confidence,
    corrections: result.corrections,
    executionTimeMs: result.executionTimeMs,
  });
});

/**
 * GET /tutor/session/:id - Get session details
 */
tutorRoutes.get('/session/:id', async (c) => {
  const user = c.get('user');
  const sessionId = c.req.param('id');

  const session = await prisma.learningSession.findFirst({
    where: {
      id: sessionId,
      student: {
        userId: user.id,
      },
    },
    include: {
      interactions: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  return c.json({ session });
});

/**
 * GET /tutor/sessions - List learning sessions
 */
tutorRoutes.get('/sessions', async (c) => {
  const user = c.get('user');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');

  const sessions = await prisma.learningSession.findMany({
    where: {
      student: {
        userId: user.id,
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      _count: {
        select: { interactions: true },
      },
    },
  });

  const total = await prisma.learningSession.count({
    where: {
      student: {
        userId: user.id,
      },
    },
  });

  return c.json({
    sessions,
    pagination: {
      total,
      limit,
      offset,
    },
  });
});

/**
 * PUT /tutor/session/:id/end - End a learning session
 */
tutorRoutes.put('/session/:id/end', async (c) => {
  const user = c.get('user');
  const sessionId = c.req.param('id');

  const session = await prisma.learningSession.findFirst({
    where: {
      id: sessionId,
      student: {
        userId: user.id,
      },
    },
  });

  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  const updatedSession = await prisma.learningSession.update({
    where: { id: sessionId },
    data: {
      endedAt: new Date(),
      durationMinutes: Math.round(
        (Date.now() - session.startedAt.getTime()) / 60000
      ),
    },
  });

  return c.json({ session: updatedSession });
});

/**
 * POST /tutor/feedback - Submit feedback on AI response
 */
tutorRoutes.post('/feedback', zValidator('json', z.object({
  interactionId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
})), async (c) => {
  const user = c.get('user');
  const { interactionId, rating, feedback } = c.req.valid('json');

  // Verify the interaction belongs to the user
  const interaction = await prisma.interaction.findFirst({
    where: {
      id: interactionId,
      session: {
        student: {
          userId: user.id,
        },
      },
    },
  });

  if (!interaction) {
    return c.json({ error: 'Interaction not found' }, 404);
  }

  // Store feedback (in production, store in a separate table)
  console.log(`Feedback received: interaction=${interactionId}, rating=${rating}, feedback=${feedback}`);

  return c.json({ success: true });
});
