/**
 * EduForge Chat API
 *
 * Main chat endpoint that uses the unified AI service.
 * Supports both streaming and non-streaming responses.
 *
 * For local development: Uses Ollama (set AI_PROVIDER=ollama)
 * For production: Uses Anthropic Claude (set AI_PROVIDER=anthropic)
 */

import { NextRequest, NextResponse } from 'next/server';

// Learning modes with their system prompts
const MODE_PROMPTS: Record<string, string> = {
  LEARN: `You are EduForge AI, a patient and encouraging educational tutor using the Socratic method.

Your approach:
1. Never give answers directly - guide students to discover them
2. Ask probing questions to understand their current thinking
3. Break complex concepts into smaller, manageable pieces
4. Use analogies from everyday life
5. Celebrate progress and maintain encouragement
6. Identify and gently correct misconceptions

When a student seems stuck:
- Acknowledge their effort
- Simplify your explanation
- Provide a concrete example
- Ask a simpler leading question

Format responses with markdown for clarity when helpful.`,

  PRACTICE: `You are EduForge AI in Practice Mode.

Your role:
1. Present problems appropriate to the student's level
2. Provide progressive hints when requested (don't give away answers)
3. Check work and give detailed feedback on errors
4. Explain WHY something is wrong, not just WHAT is wrong
5. Offer similar problems for reinforcement

After each problem:
- If correct: Praise specifically, then offer a slightly harder problem
- If incorrect: Guide toward the error without solving it for them`,

  EXAM: `You are EduForge AI in Exam Preparation Mode.

Your role:
1. Help students prepare for specific exams
2. Practice exam-style questions with proper formatting
3. Teach exam techniques and mark scheme requirements
4. Focus on command words: describe, explain, evaluate, analyse, compare
5. Build confidence through structured practice

Key exam tips to reinforce:
- Time management strategies
- How to structure long-answer responses
- Common pitfalls to avoid
- Mark scheme patterns`,

  DEBUG: `You are EduForge AI in Debug Mode for misconception correction.

Follow this 4-step process:
1. IDENTIFY: Clearly state what the misconception is
2. EXPLAIN: Explain why this is a common mistake and what's correct
3. CONTRAST: Show side-by-side comparison of wrong vs correct thinking
4. VERIFY: Ask a follow-up question to check understanding

Be encouraging - misconceptions are learning opportunities!
Use concrete examples, avoid abstract explanations.`,

  REVIEW: `You are EduForge AI in Review Mode for spaced repetition.

Your role:
1. Help students review previously learned material
2. Focus on retrieval practice over re-reading
3. Reinforce connections between related concepts
4. Identify areas needing more practice
5. Celebrate retained knowledge

Keep reviews efficient and engaging.
If a student struggles with a concept, note it needs more review time.`,
};

// In-memory session storage for development
const sessions = new Map<string, {
  id: string;
  mode: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }>;
  studentProfile?: {
    learningStyle?: string;
    specialNeeds?: string[];
    masteryLevel?: number;
  };
  createdAt: number;
  updatedAt: number;
}>();

// AI Service - dynamically import to avoid build issues
async function getAIResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  mode: string,
  stream: boolean = false
): Promise<{ content: string; model: string } | ReadableStream> {
  const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.LEARN;

  // Try Ollama first for local dev
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

  const ollamaMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  if (stream) {
    // Return streaming response
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        messages: ollamaMessages,
        stream: true,
        options: {
          temperature: 0.7,
          num_predict: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    return response.body!;
  }

  // Non-streaming response
  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: ollamaModel,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.message?.content || 'No response generated',
    model: data.model || ollamaModel,
  };
}

/**
 * GET /api/chat - Get session info or list sessions
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const action = searchParams.get('action');

  // Health check / provider status
  if (action === 'status') {
    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          provider: 'ollama',
          status: 'connected',
          models: data.models?.map((m: { name: string }) => m.name) || [],
          currentModel: process.env.OLLAMA_MODEL || 'llama3.2',
          baseUrl: ollamaUrl,
        });
      }
    } catch (error) {
      return NextResponse.json({
        provider: 'ollama',
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Connection failed',
        hint: 'Make sure Ollama is running: ollama serve',
      });
    }
  }

  // Get specific session
  if (sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  // List all sessions
  return NextResponse.json({
    sessions: Array.from(sessions.values()).map(s => ({
      id: s.id,
      mode: s.mode,
      messageCount: s.messages.length,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
  });
}

/**
 * POST /api/chat - Send a message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      sessionId,
      mode = 'LEARN',
      stream = false,
      newSession = false,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create session
    let session = sessionId && !newSession ? sessions.get(sessionId) : null;

    if (!session) {
      const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      session = {
        id: newId,
        mode,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      sessions.set(newId, session);
    }

    // Update mode if changed
    if (mode !== session.mode) {
      session.mode = mode;
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    // Get AI response
    const startTime = Date.now();

    if (stream) {
      // Streaming response
      try {
        const streamBody = await getAIResponse(
          session.messages.map(m => ({ role: m.role, content: m.content })),
          session.mode,
          true
        ) as ReadableStream;

        // Create a transform stream to capture the full response
        let fullContent = '';
        const transformStream = new TransformStream({
          transform(chunk, controller) {
            const text = new TextDecoder().decode(chunk);
            const lines = text.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                  fullContent += json.message.content;
                  // Forward as SSE format
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ content: json.message.content, done: json.done })}\n\n`)
                  );
                }
                if (json.done) {
                  // Save the complete message
                  session!.messages.push({
                    role: 'assistant',
                    content: fullContent,
                    timestamp: Date.now(),
                  });
                  session!.updatedAt = Date.now();
                }
              } catch {
                // Skip invalid JSON
              }
            }
          },
        });

        const responseStream = streamBody.pipeThrough(transformStream);

        return new Response(responseStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (error) {
        console.error('Stream error:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Stream failed' },
          { status: 500 }
        );
      }
    }

    // Non-streaming response
    try {
      const result = await getAIResponse(
        session.messages.map(m => ({ role: m.role, content: m.content })),
        session.mode,
        false
      ) as { content: string; model: string };

      const latencyMs = Date.now() - startTime;

      // Add assistant message
      session.messages.push({
        role: 'assistant',
        content: result.content,
        timestamp: Date.now(),
      });
      session.updatedAt = Date.now();

      return NextResponse.json({
        response: {
          content: result.content,
          model: result.model,
        },
        session: {
          id: session.id,
          mode: session.mode,
          messageCount: session.messages.length,
        },
        latencyMs,
      });
    } catch (error) {
      console.error('Chat error:', error);

      // Check if it's an Ollama connection error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED')) {
        return NextResponse.json({
          error: 'Cannot connect to Ollama',
          hint: 'Make sure Ollama is running. Start it with: ollama serve',
          details: errorMessage,
        }, { status: 503 });
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Request error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/chat - Update session (change mode, update profile)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, mode, studentProfile } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (mode) {
      session.mode = mode;
    }

    if (studentProfile) {
      session.studentProfile = {
        ...session.studentProfile,
        ...studentProfile,
      };
    }

    session.updatedAt = Date.now();

    return NextResponse.json({
      session: {
        id: session.id,
        mode: session.mode,
        studentProfile: session.studentProfile,
        messageCount: session.messages.length,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/chat - Delete a session
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId is required' },
      { status: 400 }
    );
  }

  const deleted = sessions.delete(sessionId);

  return NextResponse.json({
    deleted,
    sessionId,
  });
}
