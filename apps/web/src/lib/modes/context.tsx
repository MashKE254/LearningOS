'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import {
  LearningMode,
  ModeState,
  ModeConfig,
  ModeContextValue,
  ModeSuggestion,
  TransitionTrigger,
  MODE_CONFIGS,
} from './types';
import {
  createInitialState,
  canTransition,
  transition,
  recordQuestion,
  getElapsedTime,
  shouldSuggestModeSwitch,
  serializeState,
  deserializeState,
} from './state-machine';

// Storage key for persisting mode state
const MODE_STATE_KEY = 'eduforge_mode_state';

// Actions
type ModeAction =
  | { type: 'SWITCH_MODE'; payload: { mode: LearningMode; trigger: TransitionTrigger; metadata?: Record<string, unknown> } }
  | { type: 'SUGGEST_MODE'; payload: { mode: LearningMode; reason: string; confidence?: number } }
  | { type: 'DISMISS_SUGGESTION' }
  | { type: 'RECORD_QUESTION'; payload: { correct: boolean; confidence?: number; hintsUsed?: number; concepts?: string[] } }
  | { type: 'RESET_SESSION' }
  | { type: 'HYDRATE'; payload: ModeState };

interface ModeReducerState {
  modeState: ModeState;
  pendingSuggestion: ModeSuggestion | null;
}

function modeReducer(
  state: ModeReducerState,
  action: ModeAction
): ModeReducerState {
  switch (action.type) {
    case 'SWITCH_MODE': {
      const newModeState = transition(
        state.modeState,
        action.payload.mode,
        action.payload.trigger,
        action.payload.metadata
      );
      return {
        modeState: newModeState,
        pendingSuggestion: null, // Clear suggestion on mode switch
      };
    }

    case 'SUGGEST_MODE': {
      return {
        ...state,
        pendingSuggestion: {
          suggestedMode: action.payload.mode,
          reason: action.payload.reason,
          confidence: action.payload.confidence ?? 0.8,
          timestamp: new Date(),
        },
      };
    }

    case 'DISMISS_SUGGESTION': {
      return {
        ...state,
        pendingSuggestion: null,
      };
    }

    case 'RECORD_QUESTION': {
      const newModeState = recordQuestion(
        state.modeState,
        action.payload.correct,
        action.payload.confidence,
        action.payload.hintsUsed,
        action.payload.concepts
      );

      // Check if we should suggest a mode switch
      const suggestion = shouldSuggestModeSwitch(newModeState);

      return {
        modeState: newModeState,
        pendingSuggestion: suggestion.suggest
          ? {
              suggestedMode: suggestion.mode!,
              reason: suggestion.reason!,
              confidence: 0.8,
              timestamp: new Date(),
            }
          : state.pendingSuggestion,
      };
    }

    case 'RESET_SESSION': {
      return {
        modeState: createInitialState(state.modeState.currentMode),
        pendingSuggestion: null,
      };
    }

    case 'HYDRATE': {
      return {
        modeState: action.payload,
        pendingSuggestion: null,
      };
    }

    default:
      return state;
  }
}

// Context
const ModeContext = createContext<ModeContextValue | null>(null);

// Provider Props
interface ModeProviderProps {
  children: React.ReactNode;
  initialMode?: LearningMode;
  persistState?: boolean;
}

// Provider Component
export function ModeProvider({
  children,
  initialMode = 'LEARN',
  persistState = true,
}: ModeProviderProps) {
  const [state, dispatch] = useReducer(modeReducer, {
    modeState: createInitialState(initialMode),
    pendingSuggestion: null,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(MODE_STATE_KEY);
        if (stored) {
          const hydratedState = deserializeState(stored);
          dispatch({ type: 'HYDRATE', payload: hydratedState });
        }
      } catch (e) {
        console.warn('Failed to hydrate mode state:', e);
      }
    }
  }, [persistState]);

  // Persist to localStorage on state changes
  useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      try {
        localStorage.setItem(MODE_STATE_KEY, serializeState(state.modeState));
      } catch (e) {
        console.warn('Failed to persist mode state:', e);
      }
    }
  }, [state.modeState, persistState]);

  // Actions
  const switchMode = useCallback(
    (mode: LearningMode, trigger: TransitionTrigger = 'user_request') => {
      dispatch({ type: 'SWITCH_MODE', payload: { mode, trigger } });
    },
    []
  );

  const suggestModeSwitch = useCallback((mode: LearningMode, reason: string) => {
    dispatch({ type: 'SUGGEST_MODE', payload: { mode, reason } });
  }, []);

  const dismissSuggestion = useCallback(() => {
    dispatch({ type: 'DISMISS_SUGGESTION' });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  // This will be called by the learning interface when a question is answered
  const handleQuestionAnswered = useCallback(
    (
      correct: boolean,
      confidence?: number,
      hintsUsed?: number,
      concepts?: string[]
    ) => {
      dispatch({
        type: 'RECORD_QUESTION',
        payload: { correct, confidence, hintsUsed, concepts },
      });
    },
    []
  );

  // Computed values
  const canSwitchToMode = useCallback(
    (mode: LearningMode) => canTransition(state.modeState.currentMode, mode),
    [state.modeState.currentMode]
  );

  const getElapsedTimeValue = useCallback(
    () => getElapsedTime(state.modeState),
    [state.modeState]
  );

  // Current mode config
  const config = useMemo(
    () => MODE_CONFIGS[state.modeState.currentMode],
    [state.modeState.currentMode]
  );

  const contextValue: ModeContextValue = useMemo(
    () => ({
      state: state.modeState,
      config,
      switchMode,
      suggestModeSwitch,
      dismissSuggestion,
      resetSession,
      canSwitchTo: canSwitchToMode,
      getElapsedTime: getElapsedTimeValue,
      pendingSuggestion: state.pendingSuggestion,
      // Expose question tracking for learning interface
      recordQuestion: handleQuestionAnswered,
    }),
    [
      state.modeState,
      state.pendingSuggestion,
      config,
      switchMode,
      suggestModeSwitch,
      dismissSuggestion,
      resetSession,
      canSwitchToMode,
      getElapsedTimeValue,
      handleQuestionAnswered,
    ]
  );

  return (
    <ModeContext.Provider value={contextValue}>{children}</ModeContext.Provider>
  );
}

// Hook for consuming the mode context
export function useMode(): ModeContextValue & { recordQuestion: (correct: boolean, confidence?: number, hintsUsed?: number, concepts?: string[]) => void } {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context as ModeContextValue & { recordQuestion: (correct: boolean, confidence?: number, hintsUsed?: number, concepts?: string[]) => void };
}

// Hook for just the current mode (lighter weight)
export function useCurrentMode(): LearningMode {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useCurrentMode must be used within a ModeProvider');
  }
  return context.state.currentMode;
}

// Hook for mode config
export function useModeConfig(): ModeConfig {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useModeConfig must be used within a ModeProvider');
  }
  return context.config;
}

// Hook for checking available transitions
export function useAvailableTransitions(): LearningMode[] {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useAvailableTransitions must be used within a ModeProvider');
  }
  return context.config.allowedTransitions;
}
