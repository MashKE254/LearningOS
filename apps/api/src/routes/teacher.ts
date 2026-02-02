/**
 * Teacher Routes
 * 
 * Classroom management, student monitoring, and institutional features.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { prisma } from '@eduforge/database';

export const teacherRoutes = new Hono();

/**
 * GET /teacher/profile - Get teacher profile
 */
teacherRoutes.get('/profile', async (c) => {
  const user = c.get('user');

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    include: {
      institution: true,
      classes: {
        include: {
          _count: {
            select: { enrollments: true, assignments: true },
          },
        },
      },
    },
  });

  if (!profile) {
    return c.json({ error: 'Teacher profile not found' }, 404);
  }

  return c.json({ profile });
});

/**
 * POST /teacher/class - Create a new class
 */
teacherRoutes.post('/class', zValidator('json', z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(50),
  gradeLevel: z.number().int().min(1).max(12).optional(),
  curriculumId: z.string().optional(),
  academicYear: z.string().optional(),
})), async (c) => {
  const user = c.get('user');
  const { name, subject, gradeLevel, curriculumId, academicYear } = c.req.valid('json');

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return c.json({ error: 'Teacher profile not found' }, 404);
  }

  const newClass = await prisma.class.create({
    data: {
      name,
      subject,
      gradeLevel,
      curriculumId,
      academicYear: academicYear || new Date().getFullYear().toString(),
      teacherId: profile.id,
      institutionId: profile.institutionId,
      joinCode: generateJoinCode(),
    },
  });

  return c.json({ class: newClass }, 201);
});

/**
 * GET /teacher/class/:id - Get class details with students
 */
teacherRoutes.get('/class/:id', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');

  const teacherClass = await prisma.class.findFirst({
    where: {
      id: classId,
      teacher: {
        userId: user.id,
      },
    },
    include: {
      curriculum: {
        include: { examBoard: true },
      },
      enrollments: {
        include: {
          student: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      },
      assignments: {
        orderBy: { dueDate: 'desc' },
        take: 10,
      },
    },
  });

  if (!teacherClass) {
    return c.json({ error: 'Class not found' }, 404);
  }

  return c.json({ class: teacherClass });
});

/**
 * POST /teacher/class/:id/student - Add student to class
 */
teacherRoutes.post('/class/:id/student', zValidator('json', z.object({
  studentEmail: z.string().email(),
})), async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');
  const { studentEmail } = c.req.valid('json');

  // Verify teacher owns this class
  const teacherClass = await prisma.class.findFirst({
    where: {
      id: classId,
      teacher: { userId: user.id },
    },
  });

  if (!teacherClass) {
    return c.json({ error: 'Class not found' }, 404);
  }

  // Find student
  const studentUser = await prisma.user.findUnique({
    where: { email: studentEmail },
    include: { studentProfile: true },
  });

  if (!studentUser?.studentProfile) {
    return c.json({ error: 'Student not found' }, 404);
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.classEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId,
        studentId: studentUser.studentProfile.id,
      },
    },
  });

  if (existingEnrollment) {
    return c.json({ error: 'Student already enrolled' }, 400);
  }

  const enrollment = await prisma.classEnrollment.create({
    data: {
      classId,
      studentId: studentUser.studentProfile.id,
    },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return c.json({ enrollment }, 201);
});

/**
 * DELETE /teacher/class/:classId/student/:studentId - Remove student from class
 */
teacherRoutes.delete('/class/:classId/student/:studentId', async (c) => {
  const user = c.get('user');
  const { classId, studentId } = c.req.param();

  // Verify teacher owns this class
  const teacherClass = await prisma.class.findFirst({
    where: {
      id: classId,
      teacher: { userId: user.id },
    },
  });

  if (!teacherClass) {
    return c.json({ error: 'Class not found' }, 404);
  }

  await prisma.classEnrollment.delete({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
  });

  return c.json({ success: true });
});

/**
 * GET /teacher/class/:id/progress - Get class progress overview
 */
teacherRoutes.get('/class/:id/progress', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');

  // Verify teacher owns this class
  const teacherClass = await prisma.class.findFirst({
    where: {
      id: classId,
      teacher: { userId: user.id },
    },
    include: {
      enrollments: {
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              knowledgeNodes: {
                where: teacherClass?.curriculumId ? {
                  concept: {
                    topic: {
                      unit: { curriculumId: teacherClass.curriculumId },
                    },
                  },
                } : undefined,
              },
            },
          },
        },
      },
    },
  });

  if (!teacherClass) {
    return c.json({ error: 'Class not found' }, 404);
  }

  // Calculate per-student metrics
  const studentProgress = teacherClass.enrollments.map(enrollment => {
    const nodes = enrollment.student.knowledgeNodes;
    const avgMastery = nodes.length > 0
      ? nodes.reduce((sum, kn) => sum + kn.masteryLevel, 0) / nodes.length
      : 0;
    const struggling = nodes.filter(kn => kn.masteryLevel < 0.4).length;
    const mastered = nodes.filter(kn => kn.masteryLevel >= 0.8).length;

    return {
      studentId: enrollment.student.id,
      studentName: enrollment.student.user.name,
      conceptsCovered: nodes.length,
      avgMastery: Math.round(avgMastery * 100),
      strugglingCount: struggling,
      masteredCount: mastered,
      needsIntervention: struggling >= 3 || avgMastery < 0.3,
    };
  });

  // Class-wide metrics
  const classAvgMastery = studentProgress.length > 0
    ? studentProgress.reduce((sum, sp) => sum + sp.avgMastery, 0) / studentProgress.length
    : 0;

  const interventionNeeded = studentProgress.filter(sp => sp.needsIntervention);

  return c.json({
    classId,
    totalStudents: studentProgress.length,
    classAvgMastery: Math.round(classAvgMastery),
    interventionNeeded: interventionNeeded.length,
    students: studentProgress.sort((a, b) => a.avgMastery - b.avgMastery),
  });
});

/**
 * GET /teacher/class/:id/interventions - Get AI-suggested interventions
 */
teacherRoutes.get('/class/:id/interventions', async (c) => {
  const user = c.get('user');
  const classId = c.req.param('id');

  // Verify teacher owns this class
  const teacherClass = await prisma.class.findFirst({
    where: {
      id: classId,
      teacher: { userId: user.id },
    },
    include: {
      enrollments: {
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              knowledgeNodes: {
                where: { masteryLevel: { lt: 0.4 } },
                include: {
                  concept: {
                    include: {
                      topic: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacherClass) {
    return c.json({ error: 'Class not found' }, 404);
  }

  // Generate interventions
  const interventions: Array<{
    priority: 'urgent' | 'high' | 'medium';
    studentName: string;
    studentId: string;
    concept: string;
    topic: string;
    mastery: number;
    misconceptions: unknown[];
    suggestedAction: string;
  }> = [];

  for (const enrollment of teacherClass.enrollments) {
    for (const node of enrollment.student.knowledgeNodes) {
      const priority = node.masteryLevel < 0.2 ? 'urgent' 
        : node.masteryLevel < 0.3 ? 'high' : 'medium';
      
      let suggestedAction = '';
      if (node.misconceptions && (node.misconceptions as unknown[]).length > 0) {
        suggestedAction = `Address misconceptions through targeted questioning`;
      } else if (node.masteryLevel < 0.2) {
        suggestedAction = `One-on-one session recommended - foundational gaps present`;
      } else {
        suggestedAction = `Assign practice problems focusing on ${node.concept.name}`;
      }

      interventions.push({
        priority,
        studentName: enrollment.student.user.name,
        studentId: enrollment.student.id,
        concept: node.concept.name,
        topic: node.concept.topic.name,
        mastery: Math.round(node.masteryLevel * 100),
        misconceptions: (node.misconceptions as unknown[]) || [],
        suggestedAction,
      });
    }
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2 };
  interventions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return c.json({ interventions: interventions.slice(0, 20) });
});

/**
 * POST /teacher/assignment - Create an assignment
 */
teacherRoutes.post('/assignment', zValidator('json', z.object({
  classId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  topicId: z.string().optional(),
  dueDate: z.string().datetime(),
  settings: z.object({
    questionCount: z.number().min(1).max(50).default(10),
    difficulty: z.number().min(1).max(5).default(3),
    timeLimit: z.number().min(5).max(180).optional(),
    allowRetakes: z.boolean().default(false),
    randomizeQuestions: z.boolean().default(true),
  }).optional(),
})), async (c) => {
  const user = c.get('user');
  const { classId, title, description, topicId, dueDate, settings } = c.req.valid('json');

  // Verify teacher owns this class
  const teacherClass = await prisma.class.findFirst({
    where: {
      id: classId,
      teacher: { userId: user.id },
    },
  });

  if (!teacherClass) {
    return c.json({ error: 'Class not found' }, 404);
  }

  const assignment = await prisma.assignment.create({
    data: {
      classId,
      title,
      description,
      topicId,
      dueDate: new Date(dueDate),
      settings: settings || {},
    },
  });

  return c.json({ assignment }, 201);
});

/**
 * GET /teacher/assignment/:id - Get assignment with submissions
 */
teacherRoutes.get('/assignment/:id', async (c) => {
  const user = c.get('user');
  const assignmentId = c.req.param('id');

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      class: {
        teacher: { userId: user.id },
      },
    },
    include: {
      class: true,
      topic: true,
      submissions: {
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

  if (!assignment) {
    return c.json({ error: 'Assignment not found' }, 404);
  }

  // Calculate statistics
  const submissions = assignment.submissions;
  const submitted = submissions.length;
  const totalStudents = await prisma.classEnrollment.count({
    where: { classId: assignment.classId },
  });
  const avgScore = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length
    : 0;

  return c.json({
    assignment,
    stats: {
      totalStudents,
      submitted,
      pending: totalStudents - submitted,
      avgScore: Math.round(avgScore),
    },
  });
});

/**
 * GET /teacher/copilot - AI teaching assistant suggestions
 */
teacherRoutes.get('/copilot', async (c) => {
  const user = c.get('user');

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    include: {
      classes: {
        include: {
          enrollments: {
            include: {
              student: {
                include: {
                  knowledgeNodes: {
                    where: { masteryLevel: { lt: 0.5 } },
                    include: {
                      concept: { include: { topic: true } },
                    },
                  },
                  learningSessions: {
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!profile) {
    return c.json({ error: 'Teacher profile not found' }, 404);
  }

  const suggestions: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    action: string;
    data?: Record<string, unknown>;
  }> = [];

  for (const cls of profile.classes) {
    // Find struggling students
    const struggling = cls.enrollments.filter(e => {
      const avgMastery = e.student.knowledgeNodes.length > 0
        ? e.student.knowledgeNodes.reduce((sum, kn) => sum + kn.masteryLevel, 0) / 
          e.student.knowledgeNodes.length
        : 0.5;
      return avgMastery < 0.4;
    });

    if (struggling.length >= 3) {
      suggestions.push({
        type: 'CLASS_REVIEW',
        priority: 'high',
        message: `${struggling.length} students in ${cls.name} are struggling`,
        action: 'Consider a review session on foundational concepts',
        data: { classId: cls.id, className: cls.name },
      });
    }

    // Find common misconceptions
    const allMisconceptions: string[] = [];
    for (const enrollment of cls.enrollments) {
      for (const node of enrollment.student.knowledgeNodes) {
        if (node.misconceptions) {
          const misconceptions = node.misconceptions as Array<{ concept: string }>;
          allMisconceptions.push(...misconceptions.map(m => m.concept));
        }
      }
    }

    const misconceptionCounts: Record<string, number> = {};
    for (const m of allMisconceptions) {
      misconceptionCounts[m] = (misconceptionCounts[m] || 0) + 1;
    }

    const commonMisconceptions = Object.entries(misconceptionCounts)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]);

    if (commonMisconceptions.length > 0) {
      suggestions.push({
        type: 'COMMON_MISCONCEPTION',
        priority: 'medium',
        message: `Common misconception in ${cls.name}: "${commonMisconceptions[0][0]}"`,
        action: 'Address this in your next class with targeted examples',
        data: { 
          classId: cls.id, 
          misconception: commonMisconceptions[0][0],
          studentCount: commonMisconceptions[0][1],
        },
      });
    }

    // Check for inactive students
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const inactive = cls.enrollments.filter(e => {
      const lastSession = e.student.learningSessions[0];
      return !lastSession || lastSession.startedAt < threeDaysAgo;
    });

    if (inactive.length > 0) {
      suggestions.push({
        type: 'INACTIVE_STUDENTS',
        priority: 'low',
        message: `${inactive.length} students in ${cls.name} haven't studied in 3+ days`,
        action: 'Send a reminder or check-in message',
        data: { classId: cls.id, count: inactive.length },
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return c.json({ suggestions: suggestions.slice(0, 10) });
});

// Helper function to generate join code
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
