'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import {
  CanvasState,
  CanvasToolType,
  CanvasContent,
  CanvasHistoryEntry,
  CanvasSubmission,
} from './types';

interface CanvasContextValue {
  state: CanvasState;
  setActiveTool: (tool: CanvasToolType | null) => void;
  updateContent: (content: CanvasContent) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  submit: (questionId?: string, conceptId?: string) => CanvasSubmission | null;
}

type CanvasAction =
  | { type: 'SET_TOOL'; payload: CanvasToolType | null }
  | { type: 'UPDATE_CONTENT'; payload: CanvasContent }
  | { type: 'CLEAR' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'MARK_CLEAN' };

const initialState: CanvasState = {
  activeTool: null,
  content: null,
  history: [],
  historyIndex: -1,
  isDirty: false,
};

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'SET_TOOL': {
      return {
        ...state,
        activeTool: action.payload,
      };
    }

    case 'UPDATE_CONTENT': {
      const newEntry: CanvasHistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        tool: state.activeTool!,
        content: action.payload,
        action: state.content ? 'update' : 'create',
      };

      // Truncate future history if we're not at the end
      const truncatedHistory = state.history.slice(0, state.historyIndex + 1);

      return {
        ...state,
        content: action.payload,
        history: [...truncatedHistory, newEntry],
        historyIndex: truncatedHistory.length,
        isDirty: true,
      };
    }

    case 'CLEAR': {
      if (!state.content) return state;

      const newEntry: CanvasHistoryEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        tool: state.activeTool!,
        content: state.content,
        action: 'clear',
      };

      const truncatedHistory = state.history.slice(0, state.historyIndex + 1);

      return {
        ...state,
        content: null,
        history: [...truncatedHistory, newEntry],
        historyIndex: truncatedHistory.length,
        isDirty: true,
      };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;

      const prevIndex = state.historyIndex - 1;
      const prevEntry = state.history[prevIndex];

      return {
        ...state,
        content: prevEntry?.content ?? null,
        historyIndex: prevIndex,
        isDirty: true,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;

      const nextIndex = state.historyIndex + 1;
      const nextEntry = state.history[nextIndex];

      return {
        ...state,
        content: nextEntry?.content ?? null,
        historyIndex: nextIndex,
        isDirty: true,
      };
    }

    case 'MARK_CLEAN': {
      return {
        ...state,
        isDirty: false,
      };
    }

    default:
      return state;
  }
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

interface CanvasProviderProps {
  children: React.ReactNode;
  initialTool?: CanvasToolType;
  onSubmit?: (submission: CanvasSubmission) => void;
}

export function CanvasProvider({
  children,
  initialTool,
  onSubmit,
}: CanvasProviderProps) {
  const [state, dispatch] = useReducer(canvasReducer, {
    ...initialState,
    activeTool: initialTool ?? null,
  });

  const setActiveTool = useCallback((tool: CanvasToolType | null) => {
    dispatch({ type: 'SET_TOOL', payload: tool });
  }, []);

  const updateContent = useCallback((content: CanvasContent) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: content });
  }, []);

  const clearCanvas = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const submit = useCallback(
    (questionId?: string, conceptId?: string): CanvasSubmission | null => {
      if (!state.content || !state.activeTool) return null;

      const submission: CanvasSubmission = {
        id: crypto.randomUUID(),
        tool: state.activeTool,
        content: state.content,
        submittedAt: new Date(),
        questionId,
        conceptId,
      };

      dispatch({ type: 'MARK_CLEAN' });
      onSubmit?.(submission);

      return submission;
    },
    [state.content, state.activeTool, onSubmit]
  );

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const value: CanvasContextValue = useMemo(
    () => ({
      state,
      setActiveTool,
      updateContent,
      clearCanvas,
      undo,
      redo,
      canUndo,
      canRedo,
      submit,
    }),
    [state, setActiveTool, updateContent, clearCanvas, undo, redo, canUndo, canRedo, submit]
  );

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}
