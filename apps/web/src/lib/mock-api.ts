/**
 * Mock API Layer for Demo Mode
 * 
 * Simulates backend responses when running without the actual API server.
 * This enables frontend development and demos without a database connection.
 */

// Demo user data
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@eduforge.ai',
  name: 'Demo Student',
  role: 'STUDENT',
  createdAt: new Date().toISOString(),
  studentProfile: {
    id: 'profile-123',
    gradeLevel: 8,
    learningStyle: 'VISUAL',
    nativeLanguage: 'en',
    dailyGoalMinutes: 30,
    currentStreak: 7,
    totalStudyMinutes: 2450,
    enrollments: [
      {
        id: 'enroll-1',
        curriculum: {
          id: 'curr-kenya-cbc-math-8',
          name: 'Grade 8 Mathematics',
          subject: 'Mathematics',
          examBoard: {
            id: 'eb-kenya-cbc',
            name: 'Kenya CBC',
            country: 'Kenya',
          },
        },
      },
    ],
  },
};

// Demo token
const DEMO_TOKEN = 'demo-jwt-token-12345';

// Demo topics with mastery levels
const DEMO_TOPICS = [
  { id: 'topic-1', name: 'Quadratic Equations', mastery: 0.75, icon: '📐' },
  { id: 'topic-2', name: 'Photosynthesis', mastery: 0.45, icon: '🌱' },
  { id: 'topic-3', name: 'Chemical Bonding', mastery: 0.60, icon: '⚗️' },
  { id: 'topic-4', name: 'Forces & Motion', mastery: 0.30, icon: '🚀' },
  { id: 'topic-5', name: 'Essay Writing', mastery: 0.85, icon: '✍️' },
  { id: 'topic-6', name: 'Statistics', mastery: 0.55, icon: '📊' },
];

// Demo progress data
const DEMO_PROGRESS = {
  streak: 7,
  totalMinutes: 2450,
  conceptsMastered: 24,
  avgMastery: 0.62,
  daily: {
    '2026-01-25': { minutes: 45, sessions: 2 },
    '2026-01-26': { minutes: 30, sessions: 1 },
    '2026-01-27': { minutes: 60, sessions: 3 },
    '2026-01-28': { minutes: 35, sessions: 2 },
    '2026-01-29': { minutes: 50, sessions: 2 },
    '2026-01-30': { minutes: 40, sessions: 2 },
    '2026-01-31': { minutes: 25, sessions: 1 },
  },
  knowledgeGraph: DEMO_TOPICS.map(t => ({
    concept: t.name,
    mastery: t.mastery,
    needsReview: t.mastery < 0.5,
  })),
};

// Socratic teaching responses
const SOCRATIC_RESPONSES: Record<string, string[]> = {
  default: [
    "That's an interesting question! Before I give you the answer directly, let me ask you something: what do you already know about this topic?",
    "Great thinking! Can you tell me what approach you've considered so far?",
    "I want to help you discover the answer yourself. What's the first step you think we should take?",
  ],
  quadratic: [
    "When you look at the equation x² + 5x + 6 = 0, what patterns do you notice?",
    "Think about this: if we need two numbers that multiply to give 6 and add to give 5, what comes to mind?",
    "You're on the right track! Now, if (x + 2)(x + 3) = 0, what does that tell us about the values of x?",
  ],
  photosynthesis: [
    "Let's think about what plants need to survive. What ingredients do you think go into making food?",
    "Good! Now, where do plants get their energy from to power this process?",
    "Excellent observation! So if sunlight + water + CO₂ goes in, what do you think comes out?",
  ],
  general_math: [
    "Before solving this, can you identify what type of problem this is?",
    "What formula or method do you think applies here?",
    "Walk me through your thinking - what's the first step you'd take?",
  ],
};

// Practice problems
const DEMO_PROBLEMS = {
  'topic-1': [
    {
      id: 'prob-1',
      question: 'Solve the quadratic equation: x² - 7x + 12 = 0',
      hints: [
        'This equation can be solved by factoring.',
        'Find two numbers that multiply to 12 and add to -7.',
        'The numbers are -3 and -4. So (x - 3)(x - 4) = 0',
      ],
      difficulty: 3,
      marks: 4,
    },
    {
      id: 'prob-2',
      question: 'Find the roots of: 2x² + 5x - 3 = 0',
      hints: [
        'Try the quadratic formula: x = (-b ± √(b²-4ac)) / 2a',
        'Here, a=2, b=5, c=-3',
        'Calculate: b²-4ac = 25 + 24 = 49',
      ],
      difficulty: 4,
      marks: 5,
    },
    {
      id: 'prob-3',
      question: 'The product of two consecutive positive integers is 72. Find the integers.',
      hints: [
        'Let the integers be x and x+1',
        'Set up the equation: x(x+1) = 72',
        'Expand: x² + x - 72 = 0',
      ],
      difficulty: 4,
      marks: 6,
    },
  ],
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate chat response
function generateChatResponse(message: string, mode: string): { content: string; citations: string[] } {
  const lowerMessage = message.toLowerCase();
  
  let responsePool = SOCRATIC_RESPONSES.default;
  
  if (lowerMessage.includes('quadratic') || lowerMessage.includes('equation')) {
    responsePool = SOCRATIC_RESPONSES.quadratic;
  } else if (lowerMessage.includes('photosynthesis') || lowerMessage.includes('plant')) {
    responsePool = SOCRATIC_RESPONSES.photosynthesis;
  } else if (lowerMessage.includes('math') || lowerMessage.includes('solve') || lowerMessage.includes('calculate')) {
    responsePool = SOCRATIC_RESPONSES.general_math;
  }
  
  const response = responsePool[Math.floor(Math.random() * responsePool.length)];
  
  return {
    content: response,
    citations: mode === 'EXAM_PREP' ? ['Kenya CBC Mathematics Syllabus, Grade 8'] : [],
  };
}

// Mock API handlers
export const mockApi = {
  // Auth endpoints
  async login(email: string, password: string) {
    await delay(500);
    
    if (email === 'demo@eduforge.ai' && password === 'demo123') {
      return {
        success: true,
        data: { token: DEMO_TOKEN, user: DEMO_USER },
      };
    }
    
    // Accept any credentials in demo mode
    return {
      success: true,
      data: { token: DEMO_TOKEN, user: { ...DEMO_USER, email, name: email.split('@')[0] } },
    };
  },
  
  async signup(data: { email: string; name: string; role: string }) {
    await delay(500);
    
    return {
      success: true,
      data: {
        token: DEMO_TOKEN,
        user: {
          ...DEMO_USER,
          email: data.email,
          name: data.name,
          role: data.role,
        },
      },
    };
  },
  
  async me() {
    await delay(200);
    return { success: true, data: { user: DEMO_USER } };
  },
  
  // Tutor endpoints
  async chat(message: string, sessionId: string | null, mode: string) {
    await delay(1000 + Math.random() * 1000); // Simulate AI thinking
    
    const response = generateChatResponse(message, mode);
    
    return {
      success: true,
      data: {
        response: {
          content: response.content,
          type: 'SOCRATIC_QUESTION',
          citations: response.citations,
          languageUsed: 'en',
          confidenceCheck: null,
        },
        session: {
          id: sessionId || `session-${Date.now()}`,
          mode,
        },
        interaction: {
          id: `int-${Date.now()}`,
          latencyMs: 800 + Math.random() * 400,
        },
      },
    };
  },
  
  async practice(topicId: string, count: number) {
    await delay(800);
    
    const problems = DEMO_PROBLEMS[topicId as keyof typeof DEMO_PROBLEMS] || [
      {
        id: `prob-${Date.now()}`,
        question: 'This is a sample practice problem for the selected topic.',
        hints: ['Think about the key concepts', 'Break down the problem', 'Apply what you know'],
        difficulty: 3,
        marks: 4,
      },
    ];
    
    return {
      success: true,
      data: {
        problems: problems.slice(0, count),
        topic: DEMO_TOPICS.find(t => t.id === topicId) || { id: topicId, name: 'Practice Topic' },
        difficulty: 3,
      },
    };
  },
  
  // Student endpoints
  async progress(period: string) {
    await delay(300);
    
    return {
      success: true,
      data: DEMO_PROGRESS,
    };
  },
  
  async knowledge() {
    await delay(300);
    
    return {
      success: true,
      data: {
        knowledgeNodes: DEMO_TOPICS.map(t => ({
          concept: { name: t.name, id: t.id },
          masteryLevel: t.mastery,
          nextReviewDate: t.mastery < 0.5 ? new Date().toISOString() : null,
        })),
        summary: {
          totalNodes: DEMO_TOPICS.length,
          avgMastery: 0.62,
          masteredCount: 2,
          needsReview: 2,
        },
      },
    };
  },
  
  async streak() {
    await delay(200);
    
    return {
      success: true,
      data: {
        currentStreak: 7,
        longestStreak: 14,
        studiedToday: true,
      },
    };
  },
  
  // Get topics for practice
  async topics() {
    await delay(300);
    
    return {
      success: true,
      data: { topics: DEMO_TOPICS },
    };
  },
};

// Check if we should use mock API
export function shouldUseMockApi(): boolean {
  // Use mock if no backend URL or if explicitly set
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ||
      !process.env.NEXT_PUBLIC_API_URL
    );
  }
  return false;
}

export { DEMO_USER, DEMO_TOKEN, DEMO_TOPICS, DEMO_PROGRESS };
