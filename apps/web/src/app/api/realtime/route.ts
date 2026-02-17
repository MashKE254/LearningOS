import { NextRequest } from 'next/server';

// Types
interface Client {
  id: string;
  userId?: string;
  classroomId?: string;
  controller: ReadableStreamDefaultController;
  connectedAt: Date;
  lastHeartbeat: Date;
}

interface Event {
  id: string;
  type: string;
  targetUserId?: string;
  targetClassroomId?: string;
  payload: unknown;
  timestamp: Date;
}

// In-memory client connections
const clients: Map<string, Client> = new Map();

// Event queue for broadcasting
const eventQueue: Event[] = [];

// Helper to send SSE message
function sendSSEMessage(
  controller: ReadableStreamDefaultController,
  event: { type: string; data: unknown; id?: string }
) {
  const encoder = new TextEncoder();
  const message = [
    event.id ? `id: ${event.id}` : '',
    `event: ${event.type}`,
    `data: ${JSON.stringify(event.data)}`,
    '',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    controller.enqueue(encoder.encode(message));
  } catch {
    // Client disconnected
  }
}

// Broadcast event to matching clients
function broadcastEvent(event: Event) {
  clients.forEach((client) => {
    // Check if event targets this client
    const matchesUser = !event.targetUserId || event.targetUserId === client.userId;
    const matchesClassroom =
      !event.targetClassroomId || event.targetClassroomId === client.classroomId;

    if (matchesUser && matchesClassroom) {
      sendSSEMessage(client.controller, {
        type: event.type,
        data: event.payload,
        id: event.id,
      });
    }
  });
}

// GET - Establish SSE connection
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const classroomId = request.nextUrl.searchParams.get('classroomId');

  const clientId = crypto.randomUUID();

  const stream = new ReadableStream({
    start(controller) {
      // Register client
      const client: Client = {
        id: clientId,
        userId: userId || undefined,
        classroomId: classroomId || undefined,
        controller,
        connectedAt: new Date(),
        lastHeartbeat: new Date(),
      };
      clients.set(clientId, client);

      // Send connection established event
      sendSSEMessage(controller, {
        type: 'connection_established',
        data: {
          clientId,
          connectedAt: client.connectedAt,
        },
      });

      // Set up heartbeat
      const heartbeatInterval = setInterval(() => {
        const currentClient = clients.get(clientId);
        if (currentClient) {
          sendSSEMessage(controller, {
            type: 'heartbeat',
            data: { timestamp: new Date() },
          });
          currentClient.lastHeartbeat = new Date();
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000); // 30 second heartbeat

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clients.delete(clientId);
        clearInterval(heartbeatInterval);
      });
    },

    cancel() {
      clients.delete(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// POST - Send event to clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, targetUserId, targetClassroomId, payload } = body;

    if (!type || !payload) {
      return Response.json(
        { error: 'type and payload are required' },
        { status: 400 }
      );
    }

    const event: Event = {
      id: crypto.randomUUID(),
      type,
      targetUserId,
      targetClassroomId,
      payload,
      timestamp: new Date(),
    };

    // Store in queue (for history)
    eventQueue.push(event);
    if (eventQueue.length > 1000) {
      eventQueue.shift(); // Keep queue size manageable
    }

    // Broadcast to connected clients
    broadcastEvent(event);

    return Response.json({
      success: true,
      event: {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
      },
      recipientCount: Array.from(clients.values()).filter((c) => {
        const matchesUser = !targetUserId || targetUserId === c.userId;
        const matchesClassroom = !targetClassroomId || targetClassroomId === c.classroomId;
        return matchesUser && matchesClassroom;
      }).length,
    });
  } catch {
    return Response.json({ error: 'Failed to send event' }, { status: 500 });
  }
}

// Helper endpoint to get connection stats
export async function PUT(request: NextRequest) {
  const classroomId = request.nextUrl.searchParams.get('classroomId');

  let connectionList = Array.from(clients.values());

  if (classroomId) {
    connectionList = connectionList.filter((c) => c.classroomId === classroomId);
  }

  return Response.json({
    totalConnections: clients.size,
    classroomConnections: connectionList.length,
    connections: connectionList.map((c) => ({
      id: c.id,
      userId: c.userId,
      classroomId: c.classroomId,
      connectedAt: c.connectedAt,
      lastHeartbeat: c.lastHeartbeat,
    })),
  });
}
