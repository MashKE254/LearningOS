import { NextRequest, NextResponse } from 'next/server';

/**
 * Collaborative Authoring with Relevance Scoring
 *
 * Inspired by 360Learning: Students and teachers create explanations,
 * practice problems, and study guides. Community upvotes quality content.
 * AI uses top-rated content in responses, with attribution.
 */

interface AuthoredContent {
  id: string;
  type: 'explanation' | 'practice_problem' | 'study_guide' | 'mnemonic' | 'analogy' | 'worked_example';
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'parent';

  // Curriculum alignment
  subject: string;
  topic: string;
  conceptId?: string;
  curriculumRef?: string;
  bloomsLevel?: string;
  gradeLevel?: number;

  // Community scoring
  upvotes: number;
  downvotes: number;
  relevanceScore: number; // Calculated: (upvotes - downvotes) / total_votes * quality_factor
  voters: Map<string, 'up' | 'down'>;
  qualityFlags: QualityFlag[];

  // AI integration
  aiVerified: boolean;
  aiQualityScore: number; // 0-1 AI assessment of accuracy and clarity
  usedInResponses: number; // How many times AI has referenced this content

  // Metadata
  tags: string[];
  language: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'flagged' | 'archived';
}

interface QualityFlag {
  userId: string;
  reason: 'inaccurate' | 'unclear' | 'off_topic' | 'duplicate' | 'inappropriate';
  details?: string;
  timestamp: Date;
}

// In-memory storage
const authoredContents: Map<string, AuthoredContent> = new Map();

// Seed with sample content
function seedContent() {
  if (authoredContents.size > 0) return;
  const samples: Partial<AuthoredContent>[] = [
    {
      type: 'explanation',
      title: 'Why Quadratic Formula Works',
      content: 'The quadratic formula is derived from completing the square on ax² + bx + c = 0. Think of it as a guaranteed recipe: no matter what values a, b, and c take, this formula always finds the x-intercepts. The discriminant (b²-4ac) tells you how many real solutions exist before you even calculate them.',
      authorName: 'Ms. Ochieng',
      authorRole: 'teacher',
      subject: 'Mathematics',
      topic: 'Quadratic Equations',
      upvotes: 47,
      downvotes: 2,
      relevanceScore: 0.92,
      aiVerified: true,
      aiQualityScore: 0.95,
      usedInResponses: 156,
      tags: ['algebra', 'quadratics', 'formula'],
    },
    {
      type: 'mnemonic',
      title: 'SOHCAHTOA Song',
      content: 'Some Old Hippie Caught Another Hippie Tripping On Acid - Sine=Opposite/Hypotenuse, Cosine=Adjacent/Hypotenuse, Tangent=Opposite/Adjacent. Works every time for right triangle trig!',
      authorName: 'Alex K.',
      authorRole: 'student',
      subject: 'Mathematics',
      topic: 'Trigonometry',
      upvotes: 89,
      downvotes: 5,
      relevanceScore: 0.88,
      aiVerified: true,
      aiQualityScore: 0.82,
      usedInResponses: 234,
      tags: ['trigonometry', 'mnemonic', 'memory'],
    },
    {
      type: 'analogy',
      title: 'Enzymes are like Locks and Keys',
      content: 'Think of enzymes as specific locks that only certain keys (substrates) can open. The active site is the keyhole — it has a unique shape. When the right key fits, the reaction happens (the door opens). This explains why enzymes are specific to certain reactions and why temperature/pH changes can "break the lock" (denaturation).',
      authorName: 'Dr. Patel',
      authorRole: 'teacher',
      subject: 'Biology',
      topic: 'Enzymes',
      upvotes: 63,
      downvotes: 1,
      relevanceScore: 0.94,
      aiVerified: true,
      aiQualityScore: 0.91,
      usedInResponses: 189,
      tags: ['biology', 'enzymes', 'analogy'],
    },
    {
      type: 'worked_example',
      title: 'Balancing Redox Equations Step by Step',
      content: '1. Split into half-equations\n2. Balance atoms other than O and H\n3. Balance O by adding H₂O\n4. Balance H by adding H⁺\n5. Balance charges by adding electrons\n6. Multiply to equalize electrons\n7. Add half-equations and simplify\n\nExample: MnO₄⁻ + Fe²⁺ → Mn²⁺ + Fe³⁺\nReduction: MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O\nOxidation: Fe²⁺ → Fe³⁺ + e⁻ (×5)\nFinal: MnO₄⁻ + 8H⁺ + 5Fe²⁺ → Mn²⁺ + 4H₂O + 5Fe³⁺',
      authorName: 'Jamie L.',
      authorRole: 'student',
      subject: 'Chemistry',
      topic: 'Redox Reactions',
      upvotes: 34,
      downvotes: 3,
      relevanceScore: 0.84,
      aiVerified: true,
      aiQualityScore: 0.88,
      usedInResponses: 97,
      tags: ['chemistry', 'redox', 'worked-example'],
    },
    {
      type: 'practice_problem',
      title: "Newton's Second Law Challenge",
      content: 'A 1500kg car accelerates from 0 to 100 km/h in 8 seconds on a flat road. (a) What net force is needed? (b) If friction provides 500N of resistance, what must the engine force be? (c) The car then goes uphill at 15°. What additional force does gravity add?\n\nHints: Convert units first. F=ma. Friction opposes motion. On a slope, gravity component = mg sin θ.',
      authorName: 'Prof. Ngugi',
      authorRole: 'teacher',
      subject: 'Physics',
      topic: "Newton's Laws",
      upvotes: 28,
      downvotes: 0,
      relevanceScore: 0.96,
      aiVerified: true,
      aiQualityScore: 0.93,
      usedInResponses: 78,
      tags: ['physics', 'forces', 'practice'],
    },
  ];

  samples.forEach((s, i) => {
    const id = `seed_${i + 1}`;
    authoredContents.set(id, {
      id,
      type: s.type as AuthoredContent['type'],
      title: s.title || '',
      content: s.content || '',
      authorId: `user_${i}`,
      authorName: s.authorName || 'Anonymous',
      authorRole: s.authorRole as AuthoredContent['authorRole'],
      subject: s.subject || '',
      topic: s.topic || '',
      upvotes: s.upvotes || 0,
      downvotes: s.downvotes || 0,
      relevanceScore: s.relevanceScore || 0,
      voters: new Map(),
      qualityFlags: [],
      aiVerified: s.aiVerified || false,
      aiQualityScore: s.aiQualityScore || 0,
      usedInResponses: s.usedInResponses || 0,
      tags: s.tags || [],
      language: 'en',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
      status: 'published',
    });
  });
}

seedContent();

// GET - Fetch authored content
export async function GET(request: NextRequest) {
  const subject = request.nextUrl.searchParams.get('subject');
  const topic = request.nextUrl.searchParams.get('topic');
  const type = request.nextUrl.searchParams.get('type');
  const sortBy = request.nextUrl.searchParams.get('sortBy') || 'relevance';
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

  let results = Array.from(authoredContents.values())
    .filter(c => c.status === 'published');

  if (subject) results = results.filter(c => c.subject.toLowerCase() === subject.toLowerCase());
  if (topic) results = results.filter(c => c.topic.toLowerCase().includes(topic.toLowerCase()));
  if (type) results = results.filter(c => c.type === type);

  switch (sortBy) {
    case 'relevance':
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
      break;
    case 'newest':
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      break;
    case 'most_used':
      results.sort((a, b) => b.usedInResponses - a.usedInResponses);
      break;
    case 'upvotes':
      results.sort((a, b) => b.upvotes - a.upvotes);
      break;
  }

  return NextResponse.json({
    content: results.slice(0, limit).map(c => ({
      ...c,
      voters: undefined,
    })),
    total: results.length,
  });
}

// POST - Create new content or vote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'vote') {
      return handleVote(body);
    }

    if (body.action === 'flag') {
      return handleFlag(body);
    }

    // Create new content
    const { type, title, content, authorId, authorName, authorRole, subject, topic, conceptId, tags, gradeLevel } = body;

    if (!type || !title || !content || !subject || !topic) {
      return NextResponse.json({ error: 'type, title, content, subject, and topic are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date();

    const authored: AuthoredContent = {
      id,
      type,
      title,
      content,
      authorId: authorId || 'anonymous',
      authorName: authorName || 'Anonymous',
      authorRole: authorRole || 'student',
      subject,
      topic,
      conceptId,
      gradeLevel,
      upvotes: 0,
      downvotes: 0,
      relevanceScore: 0,
      voters: new Map(),
      qualityFlags: [],
      aiVerified: false,
      aiQualityScore: 0,
      usedInResponses: 0,
      tags: tags || [],
      language: 'en',
      createdAt: now,
      updatedAt: now,
      status: 'published',
    };

    authoredContents.set(id, authored);

    return NextResponse.json({
      success: true,
      content: { ...authored, voters: undefined },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}

function handleVote(body: { contentId: string; userId: string; vote: 'up' | 'down' }) {
  const { contentId, userId, vote } = body;
  const item = authoredContents.get(contentId);
  if (!item) return NextResponse.json({ error: 'Content not found' }, { status: 404 });

  const existingVote = item.voters.get(userId);

  if (existingVote === vote) {
    // Remove vote
    item.voters.delete(userId);
    if (vote === 'up') item.upvotes--;
    else item.downvotes--;
  } else {
    if (existingVote) {
      // Change vote
      if (existingVote === 'up') item.upvotes--;
      else item.downvotes--;
    }
    item.voters.set(userId, vote);
    if (vote === 'up') item.upvotes++;
    else item.downvotes++;
  }

  // Recalculate relevance score
  const totalVotes = item.upvotes + item.downvotes;
  if (totalVotes > 0) {
    const voteRatio = item.upvotes / totalVotes;
    const qualityFactor = item.aiVerified ? 1.2 : 1.0;
    const usageFactor = Math.min(1.0, item.usedInResponses / 100);
    item.relevanceScore = voteRatio * 0.6 + item.aiQualityScore * 0.2 + usageFactor * 0.2;
    item.relevanceScore *= qualityFactor;
    item.relevanceScore = Math.min(1.0, item.relevanceScore);
  }

  return NextResponse.json({
    success: true,
    upvotes: item.upvotes,
    downvotes: item.downvotes,
    relevanceScore: item.relevanceScore,
  });
}

function handleFlag(body: { contentId: string; userId: string; reason: string; details?: string }) {
  const { contentId, userId, reason, details } = body;
  const item = authoredContents.get(contentId);
  if (!item) return NextResponse.json({ error: 'Content not found' }, { status: 404 });

  item.qualityFlags.push({
    userId,
    reason: reason as QualityFlag['reason'],
    details,
    timestamp: new Date(),
  });

  // Auto-flag if 3+ reports
  if (item.qualityFlags.length >= 3) {
    item.status = 'flagged';
  }

  return NextResponse.json({ success: true, status: item.status });
}

// PUT - Update content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, tags, status } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const item = authoredContents.get(id);
    if (!item) return NextResponse.json({ error: 'Content not found' }, { status: 404 });

    if (title) item.title = title;
    if (content) item.content = content;
    if (tags) item.tags = tags;
    if (status) item.status = status;
    item.updatedAt = new Date();

    return NextResponse.json({
      success: true,
      content: { ...item, voters: undefined },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
