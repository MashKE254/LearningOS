import { NextRequest, NextResponse } from 'next/server';

// Types for canvas submissions
interface CanvasSubmission {
  id: string;
  userId: string;
  tool: string;
  content: {
    type: string;
    data: unknown;
  };
  questionId?: string;
  conceptId?: string;
  submittedAt: Date;
  feedback?: {
    isCorrect: boolean;
    score?: number;
    comments: string;
    suggestions?: string[];
  };
}

// In-memory storage (replace with database in production)
const submissions: Map<string, CanvasSubmission> = new Map();

// GET - Get submissions for a user or specific submission
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const submissionId = request.nextUrl.searchParams.get('id');
  const questionId = request.nextUrl.searchParams.get('questionId');

  if (submissionId) {
    const submission = submissions.get(submissionId);
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }
    return NextResponse.json(submission);
  }

  if (userId) {
    const userSubmissions = Array.from(submissions.values())
      .filter((s) => s.userId === userId)
      .filter((s) => !questionId || s.questionId === questionId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return NextResponse.json(userSubmissions);
  }

  return NextResponse.json({ error: 'userId or id is required' }, { status: 400 });
}

// POST - Create a new canvas submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tool, content, questionId, conceptId } = body;

    if (!userId || !tool || !content) {
      return NextResponse.json(
        { error: 'userId, tool, and content are required' },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const submission: CanvasSubmission = {
      id,
      userId,
      tool,
      content,
      questionId,
      conceptId,
      submittedAt: new Date(),
    };

    submissions.set(id, submission);

    // In a real implementation, this would trigger AI evaluation
    // For now, we'll simulate feedback
    const feedback = await evaluateSubmission(submission);
    submission.feedback = feedback;
    submissions.set(id, submission);

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

// Simulated evaluation function
async function evaluateSubmission(submission: CanvasSubmission): Promise<{
  isCorrect: boolean;
  score?: number;
  comments: string;
  suggestions?: string[];
}> {
  // In a real implementation, this would call an AI model to evaluate the submission
  // For now, return simulated feedback based on tool type

  const { tool, content } = submission;

  switch (tool) {
    case 'math-editor':
      return {
        isCorrect: Math.random() > 0.3,
        score: Math.floor(Math.random() * 30) + 70,
        comments: 'Good attempt! Your approach to the problem is logical.',
        suggestions: [
          'Consider simplifying the expression in step 2',
          'Double-check your sign in the final answer',
        ],
      };

    case 'code-editor':
      return {
        isCorrect: Math.random() > 0.4,
        score: Math.floor(Math.random() * 40) + 60,
        comments: 'Your code runs correctly for the basic test cases.',
        suggestions: [
          'Consider edge cases like empty input',
          'The time complexity could be improved',
        ],
      };

    case 'diagram-tool':
      return {
        isCorrect: true,
        score: Math.floor(Math.random() * 20) + 80,
        comments: 'Your diagram clearly illustrates the concept.',
        suggestions: ['Consider adding labels to the arrows'],
      };

    default:
      return {
        isCorrect: true,
        comments: 'Submission received.',
      };
  }
}

// DELETE - Delete a submission
export async function DELETE(request: NextRequest) {
  const submissionId = request.nextUrl.searchParams.get('id');

  if (!submissionId) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const deleted = submissions.delete(submissionId);

  if (!deleted) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
