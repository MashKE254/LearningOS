import { NextRequest, NextResponse } from 'next/server';

// Types for student rooms
interface StudentRoom {
  id: string;
  name: string;
  classroomId: string;
  createdBy: string; // Teacher ID
  description?: string;
  subject: string;
  topic?: string;

  // AI Configuration
  aiConfig: {
    socraticLevel: 'high' | 'medium' | 'low' | 'off';
    hintsEnabled: boolean;
    maxHintsPerQuestion: number;
    revealAnswersAfterAttempts: number;
    allowedModes: ('LEARN' | 'PRACTICE' | 'EXAM' | 'DEBUG' | 'REVIEW')[];
    customInstructions?: string;
  };

  // Access control
  studentIds: string[];
  isOpen: boolean;
  expiresAt?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface RoomActivity {
  id: string;
  roomId: string;
  userId: string;
  action: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// In-memory storage (replace with database in production)
const studentRooms: Map<string, StudentRoom> = new Map();
const roomActivities: RoomActivity[] = [];

// GET - Get student rooms
export async function GET(request: NextRequest) {
  const classroomId = request.nextUrl.searchParams.get('classroomId');
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  const studentId = request.nextUrl.searchParams.get('studentId');
  const roomId = request.nextUrl.searchParams.get('id');

  if (roomId) {
    const room = studentRooms.get(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json(room);
  }

  let rooms = Array.from(studentRooms.values());

  if (classroomId) {
    rooms = rooms.filter((r) => r.classroomId === classroomId);
  }

  if (teacherId) {
    rooms = rooms.filter((r) => r.createdBy === teacherId);
  }

  if (studentId) {
    rooms = rooms.filter((r) => r.studentIds.includes(studentId) || r.isOpen);
  }

  // Sort by creation date (newest first)
  rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(rooms);
}

// POST - Create a new student room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      classroomId,
      createdBy,
      description,
      subject,
      topic,
      aiConfig,
      studentIds,
      isOpen,
      expiresAt,
    } = body;

    if (!name || !classroomId || !createdBy || !subject) {
      return NextResponse.json(
        { error: 'name, classroomId, createdBy, and subject are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date();

    const room: StudentRoom = {
      id,
      name,
      classroomId,
      createdBy,
      description,
      subject,
      topic,
      aiConfig: aiConfig || {
        socraticLevel: 'medium',
        hintsEnabled: true,
        maxHintsPerQuestion: 3,
        revealAnswersAfterAttempts: 4,
        allowedModes: ['LEARN', 'PRACTICE'],
      },
      studentIds: studentIds || [],
      isOpen: isOpen ?? true,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    studentRooms.set(id, room);

    // Log activity
    roomActivities.push({
      id: crypto.randomUUID(),
      roomId: id,
      userId: createdBy,
      action: 'room_created',
      details: { name, subject },
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create student room' },
      { status: 500 }
    );
  }
}

// PUT - Update a student room
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const room = studentRooms.get(id);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Update allowed fields
    const allowedFields = [
      'name',
      'description',
      'topic',
      'aiConfig',
      'studentIds',
      'isOpen',
      'expiresAt',
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        (room as Record<string, unknown>)[field] = updates[field];
      }
    }

    room.updatedAt = new Date();
    studentRooms.set(id, room);

    // Log activity
    roomActivities.push({
      id: crypto.randomUUID(),
      roomId: id,
      userId: updates.updatedBy || 'unknown',
      action: 'room_updated',
      details: updates,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      room,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update student room' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a student room
export async function DELETE(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get('id');

  if (!roomId) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const room = studentRooms.get(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  studentRooms.delete(roomId);

  // Log activity
  roomActivities.push({
    id: crypto.randomUUID(),
    roomId,
    userId: 'system',
    action: 'room_deleted',
    timestamp: new Date(),
  });

  return NextResponse.json({ success: true });
}
