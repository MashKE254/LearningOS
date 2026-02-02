/**
 * Database Seed Script
 * 
 * Populates the database with initial curriculum data for Kenya CBC
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create Exam Board: Kenya CBC
  const kenyaCBC = await prisma.examBoard.upsert({
    where: { code: 'KENYA_CBC' },
    update: {},
    create: {
      name: 'Kenya Competency Based Curriculum',
      code: 'KENYA_CBC',
      country: 'Kenya',
      website: 'https://kicd.ac.ke',
    },
  });
  console.log('✅ Created exam board:', kenyaCBC.name);

  // Create Curriculum: Grade 8 Mathematics
  const mathCurriculum = await prisma.curriculum.upsert({
    where: { id: 'kenya-cbc-math-g8' },
    update: {},
    create: {
      id: 'kenya-cbc-math-g8',
      examBoardId: kenyaCBC.id,
      name: 'Mathematics',
      code: 'MATH-G8',
      subject: 'Mathematics',
      yearGroup: 8,
      description: 'Grade 8 Mathematics covering algebra, geometry, and statistics',
      syllabusUrl: 'https://kicd.ac.ke/curriculum-reform/curricula-designs/',
    },
  });
  console.log('✅ Created curriculum:', mathCurriculum.name);

  // Create Units for Mathematics
  const units = [
    {
      id: 'math-g8-unit1',
      name: 'Numbers',
      code: 'UNIT-1',
      orderIndex: 1,
      description: 'Understanding integers, fractions, decimals and percentages',
    },
    {
      id: 'math-g8-unit2',
      name: 'Algebra',
      code: 'UNIT-2',
      orderIndex: 2,
      description: 'Algebraic expressions, equations and inequalities',
    },
    {
      id: 'math-g8-unit3',
      name: 'Geometry',
      code: 'UNIT-3',
      orderIndex: 3,
      description: 'Properties of shapes, angles and transformations',
    },
    {
      id: 'math-g8-unit4',
      name: 'Statistics',
      code: 'UNIT-4',
      orderIndex: 4,
      description: 'Data collection, representation and analysis',
    },
  ];

  for (const unit of units) {
    await prisma.curriculumUnit.upsert({
      where: { id: unit.id },
      update: {},
      create: {
        ...unit,
        curriculumId: mathCurriculum.id,
      },
    });
  }
  console.log('✅ Created', units.length, 'curriculum units');

  // Create Topics for Algebra unit
  const algebraTopics = [
    {
      id: 'topic-linear-expressions',
      name: 'Linear Expressions',
      code: 'ALG-1',
      orderIndex: 1,
      description: 'Simplifying and evaluating linear expressions',
      estimatedHours: 4,
    },
    {
      id: 'topic-linear-equations',
      name: 'Linear Equations',
      code: 'ALG-2',
      orderIndex: 2,
      description: 'Solving linear equations in one variable',
      estimatedHours: 5,
    },
    {
      id: 'topic-linear-inequalities',
      name: 'Linear Inequalities',
      code: 'ALG-3',
      orderIndex: 3,
      description: 'Solving and graphing linear inequalities',
      estimatedHours: 4,
    },
    {
      id: 'topic-quadratic-expressions',
      name: 'Quadratic Expressions',
      code: 'ALG-4',
      orderIndex: 4,
      description: 'Expanding and factorizing quadratic expressions',
      estimatedHours: 6,
    },
    {
      id: 'topic-quadratic-equations',
      name: 'Quadratic Equations',
      code: 'ALG-5',
      orderIndex: 5,
      description: 'Solving quadratic equations by factorization and formula',
      estimatedHours: 6,
    },
  ];

  for (const topic of algebraTopics) {
    await prisma.topic.upsert({
      where: { id: topic.id },
      update: {},
      create: {
        ...topic,
        unitId: 'math-g8-unit2',
      },
    });
  }
  console.log('✅ Created', algebraTopics.length, 'algebra topics');

  // Create Concepts for Quadratic Equations topic
  const quadraticConcepts = [
    {
      id: 'concept-standard-form',
      name: 'Standard Form of Quadratic Equations',
      code: 'QE-1',
      orderIndex: 1,
      description: 'Understanding ax² + bx + c = 0',
      keyPoints: ['Identifying coefficients a, b, c', 'Recognizing standard form'],
      commonMisconceptions: ['Confusing a, b, c with x values', 'Forgetting to set equation equal to zero'],
    },
    {
      id: 'concept-factorization',
      name: 'Solving by Factorization',
      code: 'QE-2',
      orderIndex: 2,
      description: 'Finding roots by factoring',
      keyPoints: ['Finding factors that multiply to ac and add to b', 'Splitting the middle term', 'Setting each factor to zero'],
      commonMisconceptions: ['Only finding one root', 'Sign errors in factors'],
      prerequisites: ['concept-standard-form'],
    },
    {
      id: 'concept-quadratic-formula',
      name: 'The Quadratic Formula',
      code: 'QE-3',
      orderIndex: 3,
      description: 'Using x = (-b ± √(b²-4ac)) / 2a',
      keyPoints: ['Memorizing the formula', 'Substituting values correctly', 'Handling the ± correctly'],
      commonMisconceptions: ['Sign errors with -b', 'Forgetting to divide by 2a', 'Not simplifying the square root'],
      prerequisites: ['concept-standard-form'],
    },
    {
      id: 'concept-discriminant',
      name: 'The Discriminant',
      code: 'QE-4',
      orderIndex: 4,
      description: 'Understanding b²-4ac and nature of roots',
      keyPoints: ['D > 0: two real roots', 'D = 0: one repeated root', 'D < 0: no real roots'],
      commonMisconceptions: ['Confusing discriminant with full formula', 'Misinterpreting zero discriminant'],
      prerequisites: ['concept-quadratic-formula'],
    },
    {
      id: 'concept-completing-square',
      name: 'Completing the Square',
      code: 'QE-5',
      orderIndex: 5,
      description: 'Transforming to vertex form',
      keyPoints: ['Halving the coefficient of x', 'Adding and subtracting the square', 'Taking square root of both sides'],
      commonMisconceptions: ['Forgetting to balance the equation', 'Sign errors when moving terms'],
      prerequisites: ['concept-standard-form'],
    },
  ];

  for (const concept of quadraticConcepts) {
    const { prerequisites, ...conceptData } = concept;
    await prisma.concept.upsert({
      where: { id: concept.id },
      update: {},
      create: {
        ...conceptData,
        topicId: 'topic-quadratic-equations',
        prerequisites: prerequisites || [],
      },
    });
  }
  console.log('✅ Created', quadraticConcepts.length, 'concepts for quadratic equations');

  // Create Learning Objectives
  const learningObjectives = [
    {
      id: 'lo-qe-1',
      conceptId: 'concept-standard-form',
      code: 'LO.QE.1',
      description: 'Identify and write quadratic equations in standard form',
      bloomsLevel: 'UNDERSTAND',
    },
    {
      id: 'lo-qe-2',
      conceptId: 'concept-factorization',
      code: 'LO.QE.2',
      description: 'Solve quadratic equations by factorization',
      bloomsLevel: 'APPLY',
    },
    {
      id: 'lo-qe-3',
      conceptId: 'concept-quadratic-formula',
      code: 'LO.QE.3',
      description: 'Apply the quadratic formula to find roots',
      bloomsLevel: 'APPLY',
    },
    {
      id: 'lo-qe-4',
      conceptId: 'concept-discriminant',
      code: 'LO.QE.4',
      description: 'Use the discriminant to determine the nature of roots',
      bloomsLevel: 'ANALYZE',
    },
    {
      id: 'lo-qe-5',
      conceptId: 'concept-completing-square',
      code: 'LO.QE.5',
      description: 'Solve quadratic equations by completing the square',
      bloomsLevel: 'APPLY',
    },
  ];

  for (const objective of learningObjectives) {
    await prisma.learningObjective.upsert({
      where: { id: objective.id },
      update: {},
      create: {
        ...objective,
        assessmentCriteria: `Student can ${objective.description.toLowerCase()}`,
      },
    });
  }
  console.log('✅ Created', learningObjectives.length, 'learning objectives');

  // Create Content Chunks for RAG
  const contentChunks = [
    {
      id: 'chunk-qe-intro',
      conceptId: 'concept-standard-form',
      type: 'EXPLANATION',
      content: `A quadratic equation is an equation of the form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0. The term 'quadratic' comes from 'quad' meaning square, as the highest power of the variable is 2.

Examples of quadratic equations:
- x² + 5x + 6 = 0 (here a=1, b=5, c=6)
- 2x² - 3x - 5 = 0 (here a=2, b=-3, c=-5)
- x² - 4 = 0 (here a=1, b=0, c=-4)`,
      language: 'en',
      gradeLevel: 8,
    },
    {
      id: 'chunk-qe-factorization',
      conceptId: 'concept-factorization',
      type: 'EXPLANATION',
      content: `To solve a quadratic equation by factorization:

1. Write the equation in standard form: ax² + bx + c = 0
2. Find two numbers that multiply to give ac and add to give b
3. Split the middle term using these numbers
4. Factor by grouping
5. Set each factor equal to zero and solve

Example: Solve x² + 5x + 6 = 0
- We need two numbers that multiply to 6 and add to 5
- The numbers are 2 and 3
- x² + 2x + 3x + 6 = 0
- x(x + 2) + 3(x + 2) = 0
- (x + 2)(x + 3) = 0
- x = -2 or x = -3`,
      language: 'en',
      gradeLevel: 8,
    },
    {
      id: 'chunk-qe-formula',
      conceptId: 'concept-quadratic-formula',
      type: 'EXPLANATION',
      content: `The Quadratic Formula allows us to solve any quadratic equation:

x = (-b ± √(b² - 4ac)) / 2a

Where a, b, and c are the coefficients from ax² + bx + c = 0

Steps to use the formula:
1. Identify a, b, and c from your equation
2. Calculate the discriminant: b² - 4ac
3. Substitute into the formula
4. Calculate both solutions (using + and -)
5. Simplify your answers

Example: Solve 2x² + 5x - 3 = 0
a = 2, b = 5, c = -3
x = (-5 ± √(25 + 24)) / 4
x = (-5 ± √49) / 4
x = (-5 ± 7) / 4
x = 0.5 or x = -3`,
      language: 'en',
      gradeLevel: 8,
    },
  ];

  for (const chunk of contentChunks) {
    await prisma.contentChunk.upsert({
      where: { id: chunk.id },
      update: {},
      create: {
        ...chunk,
        embedding: [], // Would be populated by RAG engine
      },
    });
  }
  console.log('✅ Created', contentChunks.length, 'content chunks');

  // Create sample Exam Paper
  const examPaper = await prisma.examPaper.upsert({
    where: { id: 'exam-paper-math-2024' },
    update: {},
    create: {
      id: 'exam-paper-math-2024',
      curriculumId: mathCurriculum.id,
      title: 'Grade 8 Mathematics Mock Exam 2024',
      year: 2024,
      session: 'Term 1',
      paperNumber: 1,
      duration: 120,
      totalMarks: 100,
    },
  });
  console.log('✅ Created exam paper:', examPaper.title);

  // Create sample exam questions
  const questions = [
    {
      id: 'q-factorization-1',
      examPaperId: examPaper.id,
      topicId: 'topic-quadratic-equations',
      questionNumber: 1,
      content: 'Solve the equation x² - 7x + 12 = 0 by factorization.',
      marks: 4,
      difficulty: 3,
      markingScheme: `1 mark: Identifying factors (x-3)(x-4) = 0
1 mark: Setting x-3 = 0
1 mark: Setting x-4 = 0  
1 mark: Final answers x = 3, x = 4`,
      commonMistakes: ['Incorrect signs in factors', 'Only finding one solution', 'Arithmetic errors'],
    },
    {
      id: 'q-formula-1',
      examPaperId: examPaper.id,
      topicId: 'topic-quadratic-equations',
      questionNumber: 2,
      content: 'Use the quadratic formula to solve 2x² + 3x - 5 = 0. Give your answers correct to 2 decimal places.',
      marks: 5,
      difficulty: 4,
      markingScheme: `1 mark: Correct substitution into formula
1 mark: Correct discriminant = 49
1 mark: Correct calculation of √49 = 7
1 mark: First solution x = 1
1 mark: Second solution x = -2.5`,
      commonMistakes: ['Sign error with -b', 'Forgetting ± gives two solutions', 'Rounding errors'],
    },
  ];

  for (const question of questions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {},
      create: question,
    });
  }
  console.log('✅ Created', questions.length, 'exam questions');

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@eduforge.ai' },
    update: {},
    create: {
      email: 'demo@eduforge.ai',
      name: 'Demo Student',
      passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // password: demo123
      role: 'STUDENT',
      emailVerified: true,
    },
  });
  console.log('✅ Created demo user:', demoUser.email);

  // Create student profile
  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      nativeLanguage: 'en',
      learningStyle: 'VISUAL',
      dailyGoalMinutes: 30,
      interests: ['mathematics', 'science'],
    },
  });
  console.log('✅ Created student profile');

  // Enroll student in curriculum
  await prisma.enrollment.upsert({
    where: {
      studentId_curriculumId: {
        studentId: studentProfile.id,
        curriculumId: mathCurriculum.id,
      },
    },
    update: {},
    create: {
      studentId: studentProfile.id,
      curriculumId: mathCurriculum.id,
      isActive: true,
    },
  });
  console.log('✅ Enrolled demo student in', mathCurriculum.name);

  // Create subscription
  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      tier: 'STUDENT_PRO',
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });
  console.log('✅ Created subscription for demo user');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📧 Demo login credentials:');
  console.log('   Email: demo@eduforge.ai');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
