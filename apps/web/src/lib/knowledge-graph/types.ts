/**
 * EduForge Knowledge Graph System
 *
 * Persistent learner model that tracks concept mastery, misconceptions,
 * and curriculum alignment across all interactions. Unlike competitors
 * that treat courses as silos, this builds a unified model of each learner.
 */

export interface KnowledgeNode {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  topic: string;

  // Mastery tracking
  mastery: number; // 0-1 scale
  confidence: number; // 0-1 AI's confidence in the mastery estimate
  studentConfidence: number; // 0-1 student's self-reported confidence

  // Spaced repetition
  lastReviewed: Date | null;
  nextReviewDate: Date | null;
  reviewCount: number;
  easeFactor: number; // SM-2 algorithm factor
  interval: number; // Days until next review

  // Misconception tracking
  misconceptions: Misconception[];

  // Curriculum alignment
  curriculumRefs: CurriculumReference[];
  bloomsLevel: BloomsLevel;

  // History
  firstEncountered: Date;
  lastUpdated: Date;
  interactionCount: number;

  // Connected concepts
  prerequisites: string[]; // conceptIds
  dependents: string[]; // conceptIds that depend on this
  relatedConcepts: string[]; // conceptIds
}

export interface Misconception {
  id: string;
  name: string;
  description: string;
  pattern: string; // What the student keeps doing wrong
  correctUnderstanding: string;
  occurrences: MisconceptionOccurrence[];
  status: 'active' | 'resolving' | 'resolved';
  firstDetected: Date;
  lastDetected: Date;
  resolutionAttempts: number;
  resolvedAt?: Date;
}

export interface MisconceptionOccurrence {
  sessionId: string;
  timestamp: Date;
  studentAnswer: string;
  expectedAnswer: string;
  context: string; // What question they were answering
  mode: string; // Which learning mode
}

export interface CurriculumReference {
  examBoard: string; // CIE, KNEC, IB, etc.
  subject: string;
  unit: string;
  topic: string;
  learningObjective: string;
  paperNumber?: string;
  questionStyle?: string;
}

export type BloomsLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export interface LearnerProfile {
  userId: string;

  // Knowledge state
  knowledgeNodes: Map<string, KnowledgeNode>;
  totalConceptsMastered: number; // mastery >= 0.8
  totalConceptsLearning: number; // 0.3 <= mastery < 0.8
  totalConceptsStruggling: number; // mastery < 0.3

  // Active misconceptions across all subjects
  activeMisconceptions: Misconception[];
  resolvedMisconceptions: Misconception[];

  // Cross-session analytics
  overallMastery: number; // Weighted average
  learningVelocity: number; // Concepts mastered per week
  retentionRate: number; // % of reviewed concepts retained

  // Behavioral patterns
  preferredLearningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  averageSessionDuration: number; // minutes
  peakLearningTime: string; // e.g., "14:00-16:00"

  // Confidence tracking
  confidenceDivergence: number; // Gap between student & AI confidence
  overconfidentTopics: string[]; // Student confident, AI not
  underconfidentTopics: string[]; // AI confident, student not

  // Language & accessibility
  nativeLanguage: string;
  targetLanguage: string;
  gradeLevel: number;
  specialNeeds: string[];

  // Streaks & engagement
  currentStreak: number;
  longestStreak: number;
  totalStudyTimeMinutes: number;

  lastUpdated: Date;
}

export interface KnowledgeGraphUpdate {
  type: 'mastery_update' | 'misconception_detected' | 'misconception_resolved' |
        'concept_encountered' | 'review_scheduled' | 'confidence_update';
  nodeId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface SubjectSummary {
  subject: string;
  totalConcepts: number;
  masteredConcepts: number;
  learningConcepts: number;
  strugglingConcepts: number;
  avgMastery: number;
  activeMisconceptions: number;
  topStrengths: string[];
  topWeaknesses: string[];
  recommendedFocus: string[];
}

export interface ConceptCluster {
  id: string;
  name: string;
  concepts: string[];
  avgMastery: number;
  commonMisconceptions: string[];
  suggestedMode: string;
}
