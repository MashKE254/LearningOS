import { NextRequest, NextResponse } from 'next/server';

// Types for mode transitions
interface ModeTransitionRequest {
  userId: string;
  fromMode: string;
  toMode: string;
  trigger: string;
  metadata?: Record<string, unknown>;
}

interface ModeSession {
  userId: string;
  currentMode: string;
  sessionStart: Date;
  questionsAttempted: number;
  questionsCorrect: number;
  hintsUsed: number;
  conceptsCovered: string[];
}

// In-memory storage (replace with database in production)
const modeSessions: Map<string, ModeSession> = new Map();
const modeTransitions: ModeTransitionRequest[] = [];

// GET - Get current mode session for a user
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const session = modeSessions.get(userId);

  if (!session) {
    // Create default session
    const defaultSession: ModeSession = {
      userId,
      currentMode: 'LEARN',
      sessionStart: new Date(),
      questionsAttempted: 0,
      questionsCorrect: 0,
      hintsUsed: 0,
      conceptsCovered: [],
    };
    modeSessions.set(userId, defaultSession);
    return NextResponse.json(defaultSession);
  }

  return NextResponse.json(session);
}

// POST - Record a mode transition
export async function POST(request: NextRequest) {
  try {
    const body: ModeTransitionRequest = await request.json();

    const { userId, fromMode, toMode, trigger, metadata } = body;

    if (!userId || !fromMode || !toMode || !trigger) {
      return NextResponse.json(
        { error: 'userId, fromMode, toMode, and trigger are required' },
        { status: 400 }
      );
    }

    // Validate mode transition
    const validModes = ['LEARN', 'PRACTICE', 'EXAM', 'DEBUG', 'REVIEW'];
    if (!validModes.includes(toMode)) {
      return NextResponse.json(
        { error: `Invalid mode: ${toMode}` },
        { status: 400 }
      );
    }

    // Record transition
    const transition = {
      userId,
      fromMode,
      toMode,
      trigger,
      metadata,
      timestamp: new Date(),
    };
    modeTransitions.push(body);

    // Update session
    const session = modeSessions.get(userId) || {
      userId,
      currentMode: fromMode,
      sessionStart: new Date(),
      questionsAttempted: 0,
      questionsCorrect: 0,
      hintsUsed: 0,
      conceptsCovered: [],
    };

    session.currentMode = toMode;
    modeSessions.set(userId, session);

    return NextResponse.json({
      success: true,
      transition,
      session,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process mode transition' },
      { status: 500 }
    );
  }
}

// PUT - Update mode session stats
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, questionAnswered, correct, hintsUsed, concepts } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const session = modeSessions.get(userId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update stats
    if (questionAnswered) {
      session.questionsAttempted += 1;
      if (correct) {
        session.questionsCorrect += 1;
      }
    }

    if (hintsUsed) {
      session.hintsUsed += hintsUsed;
    }

    if (concepts && Array.isArray(concepts)) {
      session.conceptsCovered = [
        ...new Set([...session.conceptsCovered, ...concepts]),
      ];
    }

    modeSessions.set(userId, session);

    return NextResponse.json({ success: true, session });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
