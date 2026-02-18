import { NextRequest, NextResponse } from 'next/server';

// Types for learning needs
interface LearningNeed {
  id: string;
  classroomId: string;
  topic: string;
  description?: string;
  createdBy: string; // Anonymous by default
  votes: number;
  voters: Set<string>;
  status: 'open' | 'addressed' | 'closed';
  createdAt: Date;
  addressedAt?: Date;
  addressedBy?: string;
  response?: string;
}

// In-memory storage (replace with database in production)
const learningNeeds: Map<string, LearningNeed> = new Map();

// GET - Get learning needs for a classroom
export async function GET(request: NextRequest) {
  const classroomId = request.nextUrl.searchParams.get('classroomId');
  const status = request.nextUrl.searchParams.get('status');
  const needId = request.nextUrl.searchParams.get('id');

  if (needId) {
    const need = learningNeeds.get(needId);
    if (!need) {
      return NextResponse.json({ error: 'Learning need not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...need,
      voters: Array.from(need.voters),
    });
  }

  if (!classroomId) {
    return NextResponse.json({ error: 'classroomId is required' }, { status: 400 });
  }

  let needs = Array.from(learningNeeds.values())
    .filter((n) => n.classroomId === classroomId);

  if (status) {
    needs = needs.filter((n) => n.status === status);
  }

  // Sort by votes (descending) then by date (newest first)
  needs.sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return NextResponse.json(
    needs.map((n) => ({
      ...n,
      voters: Array.from(n.voters),
    }))
  );
}

// POST - Create a new learning need
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classroomId, topic, description, createdBy } = body;

    if (!classroomId || !topic) {
      return NextResponse.json(
        { error: 'classroomId and topic are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const need: LearningNeed = {
      id,
      classroomId,
      topic,
      description,
      createdBy: createdBy || 'anonymous',
      votes: 1, // Creator's vote
      voters: new Set([createdBy || 'anonymous']),
      status: 'open',
      createdAt: new Date(),
    };

    learningNeeds.set(id, need);

    return NextResponse.json({
      success: true,
      need: {
        ...need,
        voters: Array.from(need.voters),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create learning need' },
      { status: 500 }
    );
  }
}

// PUT - Update a learning need (vote, address, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, userId, response } = body;

    if (!id || !action) {
      return NextResponse.json(
        { error: 'id and action are required' },
        { status: 400 }
      );
    }

    const need = learningNeeds.get(id);
    if (!need) {
      return NextResponse.json({ error: 'Learning need not found' }, { status: 404 });
    }

    switch (action) {
      case 'vote':
        if (!userId) {
          return NextResponse.json({ error: 'userId is required for voting' }, { status: 400 });
        }
        if (need.voters.has(userId)) {
          // Unvote
          need.voters.delete(userId);
          need.votes -= 1;
        } else {
          // Vote
          need.voters.add(userId);
          need.votes += 1;
        }
        break;

      case 'address':
        if (!userId) {
          return NextResponse.json({ error: 'userId is required for addressing' }, { status: 400 });
        }
        need.status = 'addressed';
        need.addressedAt = new Date();
        need.addressedBy = userId;
        if (response) {
          need.response = response;
        }
        break;

      case 'close':
        need.status = 'closed';
        break;

      case 'reopen':
        need.status = 'open';
        need.addressedAt = undefined;
        need.addressedBy = undefined;
        need.response = undefined;
        break;

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    learningNeeds.set(id, need);

    return NextResponse.json({
      success: true,
      need: {
        ...need,
        voters: Array.from(need.voters),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update learning need' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a learning need
export async function DELETE(request: NextRequest) {
  const needId = request.nextUrl.searchParams.get('id');

  if (!needId) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const deleted = learningNeeds.delete(needId);

  if (!deleted) {
    return NextResponse.json({ error: 'Learning need not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
