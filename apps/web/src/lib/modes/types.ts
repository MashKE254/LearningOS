/**
 * EduForge Learning Mode System
 *
 * The mode system is the core of EduForge's pedagogical approach.
 * Each mode has different AI behaviors, UI elements, and learning objectives.
 */

export type LearningMode = 'LEARN' | 'PRACTICE' | 'EXAM' | 'DEBUG' | 'REVIEW';

export interface ModeConfig {
  id: LearningMode;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;

  // AI Behavior Configuration
  aiBehavior: {
    socraticLevel: 'high' | 'medium' | 'low' | 'off';
    hintsEnabled: boolean;
    answersRevealed: boolean;
    proactiveNudges: boolean;
    thinkingTracesVisible: boolean;
    confidenceInputEnabled: boolean;
  };

  // UI Configuration
  ui: {
    timerVisible: boolean;
    progressBarStyle: 'continuous' | 'steps' | 'hidden';
    canvasTools: CanvasTool[];
    showExamLens: boolean;
    celebrateCorrect: boolean;
    showStreaks: boolean;
  };

  // Allowed transitions from this mode
  allowedTransitions: LearningMode[];
}

export type CanvasTool =
  | 'math-editor'
  | 'code-editor'
  | 'diagram-tool'
  | 'graph-plotter'
  | 'chemistry-drawer'
  | 'text-annotator'
  | 'whiteboard'
  | 'file-upload';

export interface ModeState {
  currentMode: LearningMode;
  previousMode: LearningMode | null;
  modeStartTime: Date;
  sessionStats: ModeSessionStats;
  transitionHistory: ModeTransition[];
}

export interface ModeSessionStats {
  questionsAttempted: number;
  questionsCorrect: number;
  hintsUsed: number;
  timeSpentMs: number;
  conceptsCovered: string[];
  averageConfidence: number;
}

export interface ModeTransition {
  fromMode: LearningMode;
  toMode: LearningMode;
  timestamp: Date;
  trigger: TransitionTrigger;
  metadata?: Record<string, unknown>;
}

export type TransitionTrigger =
  | 'user_request'
  | 'completion'
  | 'struggle_detected'
  | 'confidence_low'
  | 'time_limit'
  | 'teacher_override'
  | 'system_suggestion';

export interface ModeContextValue {
  state: ModeState;
  config: ModeConfig;

  // Actions
  switchMode: (mode: LearningMode, trigger?: TransitionTrigger) => void;
  suggestModeSwitch: (mode: LearningMode, reason: string) => void;
  dismissSuggestion: () => void;
  resetSession: () => void;

  // Computed
  canSwitchTo: (mode: LearningMode) => boolean;
  getElapsedTime: () => number;

  // Suggestion state
  pendingSuggestion: ModeSuggestion | null;
}

export interface ModeSuggestion {
  suggestedMode: LearningMode;
  reason: string;
  confidence: number;
  timestamp: Date;
}

// Mode-specific prompt modifiers for AI
export interface ModePromptConfig {
  systemPromptAddition: string;
  responseStyle: 'socratic' | 'explanatory' | 'minimal' | 'encouraging';
  maxHintsPerQuestion: number;
  revealAnswerAfterAttempts: number;
  includeThinkingTrace: boolean;
}

// Mode configuration presets
export const MODE_CONFIGS: Record<LearningMode, ModeConfig> = {
  LEARN: {
    id: 'LEARN',
    name: 'Learn',
    description: 'Explore concepts through dialogue. Ask questions, get guided to understanding.',
    icon: 'book-open',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    aiBehavior: {
      socraticLevel: 'high',
      hintsEnabled: true,
      answersRevealed: false,
      proactiveNudges: true,
      thinkingTracesVisible: true,
      confidenceInputEnabled: true,
    },
    ui: {
      timerVisible: false,
      progressBarStyle: 'continuous',
      canvasTools: ['math-editor', 'diagram-tool', 'whiteboard', 'text-annotator'],
      showExamLens: true,
      celebrateCorrect: true,
      showStreaks: false,
    },
    allowedTransitions: ['PRACTICE', 'DEBUG', 'REVIEW'],
  },

  PRACTICE: {
    id: 'PRACTICE',
    name: 'Practice',
    description: 'Solve problems with hints available. Build confidence before exams.',
    icon: 'pencil',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    aiBehavior: {
      socraticLevel: 'medium',
      hintsEnabled: true,
      answersRevealed: false,
      proactiveNudges: true,
      thinkingTracesVisible: false,
      confidenceInputEnabled: true,
    },
    ui: {
      timerVisible: true,
      progressBarStyle: 'steps',
      canvasTools: ['math-editor', 'code-editor', 'diagram-tool', 'graph-plotter', 'chemistry-drawer'],
      showExamLens: true,
      celebrateCorrect: true,
      showStreaks: true,
    },
    allowedTransitions: ['LEARN', 'EXAM', 'DEBUG', 'REVIEW'],
  },

  EXAM: {
    id: 'EXAM',
    name: 'Exam',
    description: 'Timed conditions. No hints. Just like the real thing.',
    icon: 'clock',
    color: 'red',
    gradient: 'from-red-500 to-orange-500',
    aiBehavior: {
      socraticLevel: 'off',
      hintsEnabled: false,
      answersRevealed: false,
      proactiveNudges: false,
      thinkingTracesVisible: false,
      confidenceInputEnabled: false,
    },
    ui: {
      timerVisible: true,
      progressBarStyle: 'steps',
      canvasTools: ['math-editor', 'code-editor', 'diagram-tool', 'graph-plotter', 'chemistry-drawer'],
      showExamLens: false,
      celebrateCorrect: false,
      showStreaks: false,
    },
    allowedTransitions: ['DEBUG', 'REVIEW'],
  },

  DEBUG: {
    id: 'DEBUG',
    name: 'Debug',
    description: 'Understand why you got something wrong. Deep dive into mistakes.',
    icon: 'bug',
    color: 'amber',
    gradient: 'from-amber-500 to-yellow-500',
    aiBehavior: {
      socraticLevel: 'medium',
      hintsEnabled: true,
      answersRevealed: true,
      proactiveNudges: true,
      thinkingTracesVisible: true,
      confidenceInputEnabled: true,
    },
    ui: {
      timerVisible: false,
      progressBarStyle: 'hidden',
      canvasTools: ['math-editor', 'diagram-tool', 'whiteboard', 'text-annotator'],
      showExamLens: true,
      celebrateCorrect: true,
      showStreaks: false,
    },
    allowedTransitions: ['LEARN', 'PRACTICE', 'REVIEW'],
  },

  REVIEW: {
    id: 'REVIEW',
    name: 'Review',
    description: 'Spaced repetition flashcards. Cement knowledge for the long term.',
    icon: 'repeat',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    aiBehavior: {
      socraticLevel: 'low',
      hintsEnabled: true,
      answersRevealed: false,
      proactiveNudges: false,
      thinkingTracesVisible: false,
      confidenceInputEnabled: true,
    },
    ui: {
      timerVisible: false,
      progressBarStyle: 'continuous',
      canvasTools: ['text-annotator'],
      showExamLens: false,
      celebrateCorrect: true,
      showStreaks: true,
    },
    allowedTransitions: ['LEARN', 'PRACTICE', 'DEBUG'],
  },
};

// Prompt configurations for each mode
export const MODE_PROMPTS: Record<LearningMode, ModePromptConfig> = {
  LEARN: {
    systemPromptAddition: `You are in LEARN mode. Your role is to be a Socratic tutor.
- Never give direct answers. Guide the student to discover understanding through questions.
- Ask probing questions that reveal the student's current understanding.
- When they're stuck, offer smaller stepping-stone questions.
- Celebrate genuine understanding, not just correct answers.
- If they ask "just tell me the answer", explain why discovery is more valuable, then continue guiding.
- Show your thinking process when it helps illustrate problem-solving approaches.`,
    responseStyle: 'socratic',
    maxHintsPerQuestion: 5,
    revealAnswerAfterAttempts: 0, // Never auto-reveal
    includeThinkingTrace: true,
  },

  PRACTICE: {
    systemPromptAddition: `You are in PRACTICE mode. Balance guidance with challenge.
- Provide hints when requested, but encourage independent attempts first.
- Structure hints progressively: general direction → specific technique → partial solution.
- Track which concepts the student struggles with for future review.
- Celebrate correct answers and streak milestones.
- If struggling repeatedly, suggest switching to LEARN mode for the concept.`,
    responseStyle: 'encouraging',
    maxHintsPerQuestion: 3,
    revealAnswerAfterAttempts: 4,
    includeThinkingTrace: false,
  },

  EXAM: {
    systemPromptAddition: `You are in EXAM mode. Simulate real exam conditions.
- Accept answers only. No hints, explanations, or guidance.
- Track time per question.
- After submission, only indicate correct/incorrect without explanation.
- Do not reveal correct answers until the exam session ends.
- Maintain a formal, neutral tone.`,
    responseStyle: 'minimal',
    maxHintsPerQuestion: 0,
    revealAnswerAfterAttempts: 0, // Never during exam
    includeThinkingTrace: false,
  },

  DEBUG: {
    systemPromptAddition: `You are in DEBUG mode. Help the student understand their mistakes.
- Reveal the correct answer and work through the solution step by step.
- Identify the specific misconception or error in their reasoning.
- Connect this to related concepts they may need to review.
- Ask them to explain the correct approach in their own words to verify understanding.
- Be empathetic—mistakes are learning opportunities.`,
    responseStyle: 'explanatory',
    maxHintsPerQuestion: 5,
    revealAnswerAfterAttempts: 1,
    includeThinkingTrace: true,
  },

  REVIEW: {
    systemPromptAddition: `You are in REVIEW mode. Optimize for long-term retention.
- Present flashcard-style questions based on spaced repetition scheduling.
- Accept confidence ratings (1-5) after each answer.
- Adjust review frequency based on confidence and correctness.
- Keep interactions brief and focused.
- For wrong answers, provide a concise correction and schedule sooner review.`,
    responseStyle: 'encouraging',
    maxHintsPerQuestion: 1,
    revealAnswerAfterAttempts: 2,
    includeThinkingTrace: false,
  },
};
