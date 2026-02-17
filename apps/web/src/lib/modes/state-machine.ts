/**
 * Mode State Machine
 *
 * Manages learning mode transitions with validation and history tracking.
 */

import {
  LearningMode,
  ModeState,
  ModeTransition,
  ModeSessionStats,
  TransitionTrigger,
  MODE_CONFIGS,
} from './types';

export function createInitialState(initialMode: LearningMode = 'LEARN'): ModeState {
  return {
    currentMode: initialMode,
    previousMode: null,
    modeStartTime: new Date(),
    sessionStats: createEmptyStats(),
    transitionHistory: [],
  };
}

export function createEmptyStats(): ModeSessionStats {
  return {
    questionsAttempted: 0,
    questionsCorrect: 0,
    hintsUsed: 0,
    timeSpentMs: 0,
    conceptsCovered: [],
    averageConfidence: 0,
  };
}

export function canTransition(
  fromMode: LearningMode,
  toMode: LearningMode
): boolean {
  if (fromMode === toMode) return false;

  const config = MODE_CONFIGS[fromMode];
  return config.allowedTransitions.includes(toMode);
}

export function transition(
  state: ModeState,
  toMode: LearningMode,
  trigger: TransitionTrigger = 'user_request',
  metadata?: Record<string, unknown>
): ModeState {
  const fromMode = state.currentMode;

  if (!canTransition(fromMode, toMode)) {
    console.warn(
      `Invalid mode transition: ${fromMode} -> ${toMode}. Allowed: ${MODE_CONFIGS[fromMode].allowedTransitions.join(', ')}`
    );
    return state;
  }

  const now = new Date();
  const timeInPreviousMode = now.getTime() - state.modeStartTime.getTime();

  const transitionRecord: ModeTransition = {
    fromMode,
    toMode,
    timestamp: now,
    trigger,
    metadata,
  };

  return {
    currentMode: toMode,
    previousMode: fromMode,
    modeStartTime: now,
    sessionStats: {
      ...state.sessionStats,
      timeSpentMs: state.sessionStats.timeSpentMs + timeInPreviousMode,
    },
    transitionHistory: [...state.transitionHistory, transitionRecord],
  };
}

export function updateStats(
  state: ModeState,
  updates: Partial<ModeSessionStats>
): ModeState {
  return {
    ...state,
    sessionStats: {
      ...state.sessionStats,
      ...updates,
      // Handle array merging for conceptsCovered
      conceptsCovered: updates.conceptsCovered
        ? [...new Set([...state.sessionStats.conceptsCovered, ...updates.conceptsCovered])]
        : state.sessionStats.conceptsCovered,
    },
  };
}

export function recordQuestion(
  state: ModeState,
  correct: boolean,
  confidence?: number,
  hintsUsed: number = 0,
  concepts: string[] = []
): ModeState {
  const newAttempted = state.sessionStats.questionsAttempted + 1;
  const newCorrect = state.sessionStats.questionsCorrect + (correct ? 1 : 0);
  const newHints = state.sessionStats.hintsUsed + hintsUsed;

  // Calculate running average confidence
  let newAvgConfidence = state.sessionStats.averageConfidence;
  if (confidence !== undefined) {
    const totalConfidence =
      state.sessionStats.averageConfidence * state.sessionStats.questionsAttempted +
      confidence;
    newAvgConfidence = totalConfidence / newAttempted;
  }

  return updateStats(state, {
    questionsAttempted: newAttempted,
    questionsCorrect: newCorrect,
    hintsUsed: newHints,
    averageConfidence: newAvgConfidence,
    conceptsCovered: concepts,
  });
}

export function getAccuracy(state: ModeState): number {
  if (state.sessionStats.questionsAttempted === 0) return 0;
  return (
    (state.sessionStats.questionsCorrect / state.sessionStats.questionsAttempted) *
    100
  );
}

export function getElapsedTime(state: ModeState): number {
  const now = new Date();
  return (
    state.sessionStats.timeSpentMs +
    (now.getTime() - state.modeStartTime.getTime())
  );
}

export function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function shouldSuggestModeSwitch(state: ModeState): {
  suggest: boolean;
  mode?: LearningMode;
  reason?: string;
} {
  const { currentMode, sessionStats } = state;
  const accuracy = getAccuracy(state);

  // If struggling in PRACTICE mode (low accuracy), suggest LEARN
  if (
    currentMode === 'PRACTICE' &&
    sessionStats.questionsAttempted >= 3 &&
    accuracy < 40
  ) {
    return {
      suggest: true,
      mode: 'LEARN',
      reason:
        "You seem to be struggling with these concepts. Would you like to switch to Learn mode for a deeper explanation?",
    };
  }

  // If doing well in LEARN mode, suggest PRACTICE
  if (
    currentMode === 'LEARN' &&
    sessionStats.questionsAttempted >= 3 &&
    accuracy > 80 &&
    sessionStats.averageConfidence > 3.5
  ) {
    return {
      suggest: true,
      mode: 'PRACTICE',
      reason:
        "You're showing good understanding! Ready to practice on your own?",
    };
  }

  // If very high accuracy in PRACTICE, suggest EXAM
  if (
    currentMode === 'PRACTICE' &&
    sessionStats.questionsAttempted >= 5 &&
    accuracy > 85 &&
    sessionStats.hintsUsed < 2
  ) {
    return {
      suggest: true,
      mode: 'EXAM',
      reason:
        "You're doing great without hints! Want to test yourself under exam conditions?",
    };
  }

  // After EXAM, suggest DEBUG if there were mistakes
  if (
    currentMode === 'EXAM' &&
    sessionStats.questionsAttempted >= 3 &&
    accuracy < 100
  ) {
    return {
      suggest: true,
      mode: 'DEBUG',
      reason:
        "Let's review the questions you got wrong and understand the mistakes.",
    };
  }

  // If using many hints, suggest LEARN for better understanding
  if (
    currentMode === 'PRACTICE' &&
    sessionStats.hintsUsed > sessionStats.questionsAttempted * 2
  ) {
    return {
      suggest: true,
      mode: 'LEARN',
      reason:
        "You're using a lot of hints. Let's go back to basics and build a stronger foundation.",
    };
  }

  return { suggest: false };
}

export function getModeColor(mode: LearningMode): string {
  return MODE_CONFIGS[mode].color;
}

export function getModeGradient(mode: LearningMode): string {
  return MODE_CONFIGS[mode].gradient;
}

export function getModeIcon(mode: LearningMode): string {
  return MODE_CONFIGS[mode].icon;
}

// Serialize state for storage/API
export function serializeState(state: ModeState): string {
  return JSON.stringify({
    ...state,
    modeStartTime: state.modeStartTime.toISOString(),
    transitionHistory: state.transitionHistory.map((t) => ({
      ...t,
      timestamp: t.timestamp.toISOString(),
    })),
  });
}

// Deserialize state from storage/API
export function deserializeState(json: string): ModeState {
  const parsed = JSON.parse(json);
  return {
    ...parsed,
    modeStartTime: new Date(parsed.modeStartTime),
    transitionHistory: parsed.transitionHistory.map((t: ModeTransition & { timestamp: string }) => ({
      ...t,
      timestamp: new Date(t.timestamp),
    })),
  };
}
