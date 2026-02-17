import { NextRequest, NextResponse } from 'next/server';

// Types for curriculum
interface Curriculum {
  id: string;
  code: string; // e.g., 'CIE-ALEVEL-MATH-9709'
  name: string;
  board: string; // e.g., 'CIE', 'IB', 'KCSE'
  level: string; // e.g., 'A-Level', 'IGCSE', 'IB DP'
  subject: string;
  description?: string;
  syllabus?: SyllabusStructure;
  examInfo?: ExamInfo;
  createdAt: Date;
  updatedAt: Date;
}

interface SyllabusStructure {
  units: SyllabusUnit[];
  totalTopics: number;
  totalConcepts: number;
}

interface SyllabusUnit {
  id: string;
  code: string;
  name: string;
  description?: string;
  topics: SyllabusTopic[];
  weight?: number; // Percentage of exam
}

interface SyllabusTopic {
  id: string;
  code: string;
  name: string;
  description?: string;
  concepts: string[];
  examRelevance: 'low' | 'medium' | 'high' | 'critical';
  prerequisites?: string[];
}

interface ExamInfo {
  examBoards: string[];
  paperStructure: {
    papers: {
      name: string;
      duration: number; // minutes
      marks: number;
      weight: number; // percentage
    }[];
  };
  examDates?: {
    session: string;
    dates: Date[];
  }[];
}

// In-memory storage with sample data
const curricula: Map<string, Curriculum> = new Map([
  [
    'cie-alevel-math-9709',
    {
      id: 'cie-alevel-math-9709',
      code: 'CIE-ALEVEL-MATH-9709',
      name: 'Mathematics',
      board: 'CIE',
      level: 'A-Level',
      subject: 'Mathematics',
      description: 'Cambridge International AS and A Level Mathematics',
      syllabus: {
        units: [
          {
            id: '1',
            code: 'P1',
            name: 'Pure Mathematics 1',
            description: 'Algebra, Functions, Coordinate Geometry, Calculus',
            weight: 25,
            topics: [
              {
                id: '1.1',
                code: 'P1.1',
                name: 'Quadratics',
                concepts: [
                  'Completing the square',
                  'Discriminant',
                  'Quadratic formula',
                  'Graphs of quadratics',
                ],
                examRelevance: 'high',
              },
              {
                id: '1.2',
                code: 'P1.2',
                name: 'Functions',
                concepts: [
                  'Domain and range',
                  'Composite functions',
                  'Inverse functions',
                ],
                examRelevance: 'critical',
                prerequisites: ['P1.1'],
              },
              {
                id: '1.3',
                code: 'P1.3',
                name: 'Coordinate Geometry',
                concepts: [
                  'Straight lines',
                  'Circles',
                  'Distance and midpoint',
                ],
                examRelevance: 'high',
              },
              {
                id: '1.4',
                code: 'P1.4',
                name: 'Differentiation',
                concepts: [
                  'First principles',
                  'Power rule',
                  'Chain rule',
                  'Tangents and normals',
                ],
                examRelevance: 'critical',
              },
              {
                id: '1.5',
                code: 'P1.5',
                name: 'Integration',
                concepts: [
                  'Indefinite integrals',
                  'Definite integrals',
                  'Area under curve',
                ],
                examRelevance: 'critical',
                prerequisites: ['P1.4'],
              },
            ],
          },
          {
            id: '2',
            code: 'P3',
            name: 'Pure Mathematics 3',
            description: 'Advanced algebra, calculus, and trigonometry',
            weight: 25,
            topics: [
              {
                id: '2.1',
                code: 'P3.1',
                name: 'Algebra',
                concepts: [
                  'Polynomials',
                  'Partial fractions',
                  'Binomial expansion',
                ],
                examRelevance: 'high',
              },
              {
                id: '2.2',
                code: 'P3.2',
                name: 'Trigonometry',
                concepts: [
                  'Compound angles',
                  'Double angles',
                  'R-formula',
                  'Harmonic form',
                ],
                examRelevance: 'critical',
              },
              {
                id: '2.3',
                code: 'P3.3',
                name: 'Integration Techniques',
                concepts: [
                  'Integration by parts',
                  'Substitution',
                  'Partial fractions',
                ],
                examRelevance: 'critical',
                prerequisites: ['P1.5'],
              },
            ],
          },
        ],
        totalTopics: 8,
        totalConcepts: 28,
      },
      examInfo: {
        examBoards: ['Cambridge International'],
        paperStructure: {
          papers: [
            { name: 'Paper 1 (Pure 1)', duration: 105, marks: 75, weight: 30 },
            { name: 'Paper 3 (Pure 3)', duration: 105, marks: 75, weight: 30 },
            { name: 'Paper 5 (Mechanics)', duration: 75, marks: 50, weight: 20 },
            { name: 'Paper 6 (Statistics)', duration: 75, marks: 50, weight: 20 },
          ],
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
]);

// GET - Get curricula or specific curriculum
export async function GET(request: NextRequest) {
  const curriculumId = request.nextUrl.searchParams.get('id');
  const board = request.nextUrl.searchParams.get('board');
  const subject = request.nextUrl.searchParams.get('subject');
  const search = request.nextUrl.searchParams.get('search');

  if (curriculumId) {
    const curriculum = curricula.get(curriculumId);
    if (!curriculum) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
    }
    return NextResponse.json(curriculum);
  }

  let results = Array.from(curricula.values());

  if (board) {
    results = results.filter((c) => c.board.toLowerCase() === board.toLowerCase());
  }

  if (subject) {
    results = results.filter((c) =>
      c.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }

  if (search) {
    const searchLower = search.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.code.toLowerCase().includes(searchLower) ||
        c.subject.toLowerCase().includes(searchLower)
    );
  }

  return NextResponse.json(results);
}

// POST - Create or import a curriculum
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, board, level, subject, description, syllabus, examInfo } = body;

    if (!code || !name || !board || !level || !subject) {
      return NextResponse.json(
        { error: 'code, name, board, level, and subject are required' },
        { status: 400 }
      );
    }

    const id = code.toLowerCase().replace(/\s+/g, '-');

    if (curricula.has(id)) {
      return NextResponse.json(
        { error: 'Curriculum with this code already exists' },
        { status: 409 }
      );
    }

    const now = new Date();
    const curriculum: Curriculum = {
      id,
      code,
      name,
      board,
      level,
      subject,
      description,
      syllabus,
      examInfo,
      createdAt: now,
      updatedAt: now,
    };

    curricula.set(id, curriculum);

    return NextResponse.json({
      success: true,
      curriculum,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create curriculum' },
      { status: 500 }
    );
  }
}

// PUT - Update a curriculum
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const curriculum = curricula.get(id);
    if (!curriculum) {
      return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
    }

    // Update allowed fields
    const allowedFields = ['name', 'description', 'syllabus', 'examInfo'];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        (curriculum as Record<string, unknown>)[field] = updates[field];
      }
    }

    curriculum.updatedAt = new Date();
    curricula.set(id, curriculum);

    return NextResponse.json({
      success: true,
      curriculum,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update curriculum' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a curriculum
export async function DELETE(request: NextRequest) {
  const curriculumId = request.nextUrl.searchParams.get('id');

  if (!curriculumId) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const deleted = curricula.delete(curriculumId);

  if (!deleted) {
    return NextResponse.json({ error: 'Curriculum not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
