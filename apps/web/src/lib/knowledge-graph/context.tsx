'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { KnowledgeGraphEngine } from './engine';
import {
  LearnerProfile,
  KnowledgeNode,
  SubjectSummary,
  ConceptCluster,
  KnowledgeGraphUpdate,
  CurriculumReference,
  BloomsLevel,
} from './types';

interface KnowledgeGraphState {
  engine: KnowledgeGraphEngine | null;
  profile: LearnerProfile | null;
  subjectSummaries: SubjectSummary[];
  conceptClusters: ConceptCluster[];
  reviewDue: KnowledgeNode[];
  recentUpdates: KnowledgeGraphUpdate[];
  isLoaded: boolean;
}

type KGAction =
  | { type: 'INITIALIZE'; engine: KnowledgeGraphEngine }
  | { type: 'UPDATE'; profile: LearnerProfile; updates: KnowledgeGraphUpdate[] }
  | { type: 'REFRESH_SUMMARIES'; summaries: SubjectSummary[]; clusters: ConceptCluster[]; reviewDue: KnowledgeNode[] };

function kgReducer(state: KnowledgeGraphState, action: KGAction): KnowledgeGraphState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        engine: action.engine,
        profile: action.engine.getProfile(),
        subjectSummaries: action.engine.getSubjectSummaries(),
        conceptClusters: action.engine.getConceptClusters(),
        reviewDue: action.engine.getReviewDue(),
        isLoaded: true,
      };
    case 'UPDATE':
      return {
        ...state,
        profile: action.profile,
        recentUpdates: [...action.updates, ...state.recentUpdates].slice(0, 50),
      };
    case 'REFRESH_SUMMARIES':
      return {
        ...state,
        subjectSummaries: action.summaries,
        conceptClusters: action.clusters,
        reviewDue: action.reviewDue,
      };
    default:
      return state;
  }
}

interface KnowledgeGraphContextValue {
  state: KnowledgeGraphState;
  recordInteraction: (params: {
    conceptId: string;
    conceptName: string;
    subject: string;
    topic: string;
    isCorrect: boolean;
    studentAnswer: string;
    expectedAnswer: string;
    studentConfidence: number;
    mode: string;
    sessionId: string;
    curriculumRefs?: CurriculumReference[];
    bloomsLevel?: BloomsLevel;
  }) => KnowledgeGraphUpdate[];
  getNodeMastery: (conceptId: string) => number;
  getActiveMisconceptions: () => { conceptName: string; name: string; occurrences: number }[];
  getConfidenceDivergences: () => {
    overconfident: string[];
    underconfident: string[];
    avgDivergence: number;
  };
}

const KnowledgeGraphContext = createContext<KnowledgeGraphContextValue | null>(null);

const STORAGE_KEY = 'eduforge_knowledge_graph';

export function KnowledgeGraphProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [state, dispatch] = useReducer(kgReducer, {
    engine: null,
    profile: null,
    subjectSummaries: [],
    conceptClusters: [],
    reviewDue: [],
    recentUpdates: [],
    isLoaded: false,
  });

  // Initialize from localStorage
  useEffect(() => {
    const key = `${STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);

    let engine: KnowledgeGraphEngine;
    if (stored) {
      try {
        const profile = KnowledgeGraphEngine.deserialize(stored);
        engine = new KnowledgeGraphEngine(userId, profile);
      } catch {
        engine = new KnowledgeGraphEngine(userId);
      }
    } else {
      engine = new KnowledgeGraphEngine(userId);
    }

    dispatch({ type: 'INITIALIZE', engine });
  }, [userId]);

  // Persist changes
  useEffect(() => {
    if (state.engine && state.isLoaded) {
      const key = `${STORAGE_KEY}_${userId}`;
      localStorage.setItem(key, state.engine.serialize());
    }
  }, [state.profile, state.engine, state.isLoaded, userId]);

  const recordInteraction = useCallback((params: {
    conceptId: string;
    conceptName: string;
    subject: string;
    topic: string;
    isCorrect: boolean;
    studentAnswer: string;
    expectedAnswer: string;
    studentConfidence: number;
    mode: string;
    sessionId: string;
    curriculumRefs?: CurriculumReference[];
    bloomsLevel?: BloomsLevel;
  }) => {
    if (!state.engine) return [];

    const updates = state.engine.recordInteraction(params);
    const profile = state.engine.getProfile();

    dispatch({ type: 'UPDATE', profile, updates });
    dispatch({
      type: 'REFRESH_SUMMARIES',
      summaries: state.engine.getSubjectSummaries(),
      clusters: state.engine.getConceptClusters(),
      reviewDue: state.engine.getReviewDue(),
    });

    return updates;
  }, [state.engine]);

  const getNodeMastery = useCallback((conceptId: string) => {
    if (!state.profile) return 0;
    const node = state.profile.knowledgeNodes.get(conceptId);
    return node?.mastery || 0;
  }, [state.profile]);

  const getActiveMisconceptions = useCallback(() => {
    if (!state.profile) return [];
    return state.profile.activeMisconceptions.map(m => ({
      conceptName: m.occurrences[0]?.context || 'Unknown',
      name: m.name,
      occurrences: m.occurrences.length,
    }));
  }, [state.profile]);

  const getConfidenceDivergences = useCallback(() => {
    if (!state.profile) return { overconfident: [], underconfident: [], avgDivergence: 0 };
    return {
      overconfident: state.profile.overconfidentTopics,
      underconfident: state.profile.underconfidentTopics,
      avgDivergence: state.profile.confidenceDivergence,
    };
  }, [state.profile]);

  return (
    <KnowledgeGraphContext.Provider value={{
      state,
      recordInteraction,
      getNodeMastery,
      getActiveMisconceptions,
      getConfidenceDivergences,
    }}>
      {children}
    </KnowledgeGraphContext.Provider>
  );
}

export function useKnowledgeGraph() {
  const ctx = useContext(KnowledgeGraphContext);
  if (!ctx) throw new Error('useKnowledgeGraph must be used within KnowledgeGraphProvider');
  return ctx;
}
