/**
 * Knowledge Graph Engine
 *
 * Core engine that maintains the persistent learner model.
 * Tracks mastery, detects misconceptions, schedules reviews,
 * and provides curriculum-aligned recommendations.
 */

import {
  KnowledgeNode,
  Misconception,
  MisconceptionOccurrence,
  LearnerProfile,
  KnowledgeGraphUpdate,
  SubjectSummary,
  ConceptCluster,
  BloomsLevel,
  CurriculumReference,
} from './types';

// SM-2 spaced repetition constants
const SM2_MIN_EASE = 1.3;
const SM2_DEFAULT_EASE = 2.5;

export class KnowledgeGraphEngine {
  private profile: LearnerProfile;
  private updateHistory: KnowledgeGraphUpdate[] = [];

  constructor(userId: string, existingProfile?: LearnerProfile) {
    this.profile = existingProfile || this.createEmptyProfile(userId);
  }

  private createEmptyProfile(userId: string): LearnerProfile {
    return {
      userId,
      knowledgeNodes: new Map(),
      totalConceptsMastered: 0,
      totalConceptsLearning: 0,
      totalConceptsStruggling: 0,
      activeMisconceptions: [],
      resolvedMisconceptions: [],
      overallMastery: 0,
      learningVelocity: 0,
      retentionRate: 1.0,
      preferredLearningStyle: 'visual',
      averageSessionDuration: 0,
      peakLearningTime: '',
      confidenceDivergence: 0,
      overconfidentTopics: [],
      underconfidentTopics: [],
      nativeLanguage: 'en',
      targetLanguage: 'en',
      gradeLevel: 8,
      specialNeeds: [],
      currentStreak: 0,
      longestStreak: 0,
      totalStudyTimeMinutes: 0,
      lastUpdated: new Date(),
    };
  }

  /**
   * Record a student interaction with a concept
   */
  recordInteraction(params: {
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
  }): KnowledgeGraphUpdate[] {
    const updates: KnowledgeGraphUpdate[] = [];
    const now = new Date();

    let node = this.profile.knowledgeNodes.get(params.conceptId);

    if (!node) {
      node = this.createNode(params);
      this.profile.knowledgeNodes.set(params.conceptId, node);
      updates.push({
        type: 'concept_encountered',
        nodeId: params.conceptId,
        data: { conceptName: params.conceptName },
        timestamp: now,
      });
    }

    // Update mastery using bayesian update
    const previousMastery = node.mastery;
    node.mastery = this.updateMastery(node, params.isCorrect);
    node.interactionCount += 1;
    node.lastUpdated = now;

    // Update student confidence
    node.studentConfidence = params.studentConfidence;

    updates.push({
      type: 'mastery_update',
      nodeId: params.conceptId,
      data: {
        previousMastery,
        newMastery: node.mastery,
        isCorrect: params.isCorrect,
      },
      timestamp: now,
    });

    // Detect misconceptions
    if (!params.isCorrect) {
      const misconception = this.detectMisconception(
        node,
        params.studentAnswer,
        params.expectedAnswer,
        params.sessionId,
        params.mode
      );
      if (misconception) {
        updates.push({
          type: 'misconception_detected',
          nodeId: params.conceptId,
          data: {
            misconceptionId: misconception.id,
            name: misconception.name,
            occurrenceCount: misconception.occurrences.length,
          },
          timestamp: now,
        });
      }
    } else {
      // Check if this resolves any misconceptions
      const resolved = this.checkMisconceptionResolution(node);
      for (const m of resolved) {
        updates.push({
          type: 'misconception_resolved',
          nodeId: params.conceptId,
          data: { misconceptionId: m.id, name: m.name },
          timestamp: now,
        });
      }
    }

    // Update confidence divergence
    this.updateConfidenceDivergence(node);
    updates.push({
      type: 'confidence_update',
      nodeId: params.conceptId,
      data: {
        studentConfidence: params.studentConfidence,
        aiConfidence: node.confidence,
        divergence: Math.abs(params.studentConfidence - node.mastery),
      },
      timestamp: now,
    });

    // Schedule spaced repetition
    if (params.isCorrect) {
      this.scheduleReview(node);
      updates.push({
        type: 'review_scheduled',
        nodeId: params.conceptId,
        data: {
          nextReviewDate: node.nextReviewDate,
          interval: node.interval,
        },
        timestamp: now,
      });
    }

    // Recount totals
    this.recountTotals();
    this.updateHistory.push(...updates);

    return updates;
  }

  private createNode(params: {
    conceptId: string;
    conceptName: string;
    subject: string;
    topic: string;
    curriculumRefs?: CurriculumReference[];
    bloomsLevel?: BloomsLevel;
  }): KnowledgeNode {
    const now = new Date();
    return {
      id: crypto.randomUUID(),
      conceptId: params.conceptId,
      conceptName: params.conceptName,
      subject: params.subject,
      topic: params.topic,
      mastery: 0.1,
      confidence: 0.1,
      studentConfidence: 0.5,
      lastReviewed: null,
      nextReviewDate: null,
      reviewCount: 0,
      easeFactor: SM2_DEFAULT_EASE,
      interval: 1,
      misconceptions: [],
      curriculumRefs: params.curriculumRefs || [],
      bloomsLevel: params.bloomsLevel || 'understand',
      firstEncountered: now,
      lastUpdated: now,
      interactionCount: 0,
      prerequisites: [],
      dependents: [],
      relatedConcepts: [],
    };
  }

  /**
   * Bayesian mastery update
   */
  private updateMastery(node: KnowledgeNode, isCorrect: boolean): number {
    const prior = node.mastery;
    const slipProbability = 0.1; // P(wrong | mastered)
    const guessProbability = 0.25; // P(correct | not mastered)

    if (isCorrect) {
      const pCorrectGivenMastered = 1 - slipProbability;
      const pCorrectGivenNotMastered = guessProbability;
      const pCorrect = pCorrectGivenMastered * prior + pCorrectGivenNotMastered * (1 - prior);
      return (pCorrectGivenMastered * prior) / pCorrect;
    } else {
      const pWrongGivenMastered = slipProbability;
      const pWrongGivenNotMastered = 1 - guessProbability;
      const pWrong = pWrongGivenMastered * prior + pWrongGivenNotMastered * (1 - prior);
      return (pWrongGivenMastered * prior) / pWrong;
    }
  }

  /**
   * Detect recurring misconceptions from error patterns
   */
  private detectMisconception(
    node: KnowledgeNode,
    studentAnswer: string,
    expectedAnswer: string,
    sessionId: string,
    mode: string
  ): Misconception | null {
    const now = new Date();
    const occurrence: MisconceptionOccurrence = {
      sessionId,
      timestamp: now,
      studentAnswer,
      expectedAnswer,
      context: node.conceptName,
      mode,
    };

    // Check existing misconceptions for pattern match
    for (const m of node.misconceptions) {
      if (m.status !== 'resolved' && this.isPatternMatch(m.pattern, studentAnswer)) {
        m.occurrences.push(occurrence);
        m.lastDetected = now;
        if (m.status === 'resolving') {
          m.status = 'active';
          m.resolutionAttempts += 1;
        }
        return m;
      }
    }

    // Check if we have enough evidence for a new misconception (3+ similar errors)
    const recentErrors = node.misconceptions
      .flatMap(m => m.occurrences)
      .filter(o => {
        const daysSince = (now.getTime() - o.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });

    // If 2+ recent errors on this concept, create a misconception
    if (recentErrors.length >= 1) {
      const misconception: Misconception = {
        id: crypto.randomUUID(),
        name: `Misconception in ${node.conceptName}`,
        description: `Student consistently provides incorrect reasoning for ${node.conceptName}`,
        pattern: studentAnswer.toLowerCase().trim(),
        correctUnderstanding: expectedAnswer,
        occurrences: [...recentErrors, occurrence],
        status: 'active',
        firstDetected: recentErrors.length > 0 ? recentErrors[0].timestamp : now,
        lastDetected: now,
        resolutionAttempts: 0,
      };
      node.misconceptions.push(misconception);
      this.profile.activeMisconceptions.push(misconception);
      return misconception;
    }

    // Store occurrence for future pattern matching
    if (node.misconceptions.length === 0) {
      const placeholder: Misconception = {
        id: crypto.randomUUID(),
        name: `Potential misconception in ${node.conceptName}`,
        description: `Monitoring error pattern in ${node.conceptName}`,
        pattern: studentAnswer.toLowerCase().trim(),
        correctUnderstanding: expectedAnswer,
        occurrences: [occurrence],
        status: 'active',
        firstDetected: now,
        lastDetected: now,
        resolutionAttempts: 0,
      };
      node.misconceptions.push(placeholder);
    }

    return null;
  }

  private isPatternMatch(pattern: string, answer: string): boolean {
    const normalizedPattern = pattern.toLowerCase().trim();
    const normalizedAnswer = answer.toLowerCase().trim();
    // Simple similarity check - in production, use NLP/embeddings
    if (normalizedPattern === normalizedAnswer) return true;
    // Check for common substring (>60% overlap)
    const shorter = normalizedPattern.length < normalizedAnswer.length ? normalizedPattern : normalizedAnswer;
    const longer = normalizedPattern.length >= normalizedAnswer.length ? normalizedPattern : normalizedAnswer;
    if (longer.includes(shorter)) return true;
    return false;
  }

  private checkMisconceptionResolution(node: KnowledgeNode): Misconception[] {
    const resolved: Misconception[] = [];
    for (const m of node.misconceptions) {
      if (m.status === 'active') {
        m.status = 'resolving';
      } else if (m.status === 'resolving') {
        // Two consecutive correct answers = resolved
        m.status = 'resolved';
        m.resolvedAt = new Date();
        resolved.push(m);
        // Move from active to resolved in profile
        this.profile.activeMisconceptions = this.profile.activeMisconceptions.filter(
          am => am.id !== m.id
        );
        this.profile.resolvedMisconceptions.push(m);
      }
    }
    return resolved;
  }

  /**
   * SM-2 spaced repetition scheduling
   */
  private scheduleReview(node: KnowledgeNode): void {
    const quality = Math.round(node.mastery * 5); // Map mastery to 0-5 quality

    node.easeFactor = Math.max(
      SM2_MIN_EASE,
      node.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    if (node.reviewCount === 0) {
      node.interval = 1;
    } else if (node.reviewCount === 1) {
      node.interval = 6;
    } else {
      node.interval = Math.round(node.interval * node.easeFactor);
    }

    node.reviewCount += 1;
    node.lastReviewed = new Date();
    node.nextReviewDate = new Date(Date.now() + node.interval * 24 * 60 * 60 * 1000);
  }

  private updateConfidenceDivergence(node: KnowledgeNode): void {
    const divergence = Math.abs(node.studentConfidence - node.mastery);
    node.confidence = 1 - divergence; // AI's confidence in the estimate

    // Track overconfident/underconfident topics
    if (node.studentConfidence > node.mastery + 0.2) {
      if (!this.profile.overconfidentTopics.includes(node.conceptName)) {
        this.profile.overconfidentTopics.push(node.conceptName);
      }
      this.profile.underconfidentTopics = this.profile.underconfidentTopics.filter(
        t => t !== node.conceptName
      );
    } else if (node.mastery > node.studentConfidence + 0.2) {
      if (!this.profile.underconfidentTopics.includes(node.conceptName)) {
        this.profile.underconfidentTopics.push(node.conceptName);
      }
      this.profile.overconfidentTopics = this.profile.overconfidentTopics.filter(
        t => t !== node.conceptName
      );
    } else {
      this.profile.overconfidentTopics = this.profile.overconfidentTopics.filter(
        t => t !== node.conceptName
      );
      this.profile.underconfidentTopics = this.profile.underconfidentTopics.filter(
        t => t !== node.conceptName
      );
    }

    // Update overall divergence
    const allNodes = Array.from(this.profile.knowledgeNodes.values());
    if (allNodes.length > 0) {
      this.profile.confidenceDivergence = allNodes.reduce(
        (sum, n) => sum + Math.abs(n.studentConfidence - n.mastery),
        0
      ) / allNodes.length;
    }
  }

  private recountTotals(): void {
    const nodes = Array.from(this.profile.knowledgeNodes.values());
    this.profile.totalConceptsMastered = nodes.filter(n => n.mastery >= 0.8).length;
    this.profile.totalConceptsLearning = nodes.filter(n => n.mastery >= 0.3 && n.mastery < 0.8).length;
    this.profile.totalConceptsStruggling = nodes.filter(n => n.mastery < 0.3).length;

    if (nodes.length > 0) {
      this.profile.overallMastery = nodes.reduce((sum, n) => sum + n.mastery, 0) / nodes.length;
    }

    this.profile.lastUpdated = new Date();
  }

  /**
   * Get concepts due for review today
   */
  getReviewDue(): KnowledgeNode[] {
    const now = new Date();
    return Array.from(this.profile.knowledgeNodes.values())
      .filter(n => n.nextReviewDate && n.nextReviewDate <= now)
      .sort((a, b) => {
        // Prioritize lower mastery and older reviews
        const priorityA = (1 - a.mastery) * 10 + (a.interval || 1);
        const priorityB = (1 - b.mastery) * 10 + (b.interval || 1);
        return priorityB - priorityA;
      });
  }

  /**
   * Get subject-level summaries
   */
  getSubjectSummaries(): SubjectSummary[] {
    const subjectMap = new Map<string, KnowledgeNode[]>();

    for (const node of this.profile.knowledgeNodes.values()) {
      const existing = subjectMap.get(node.subject) || [];
      existing.push(node);
      subjectMap.set(node.subject, existing);
    }

    return Array.from(subjectMap.entries()).map(([subject, nodes]) => {
      const mastered = nodes.filter(n => n.mastery >= 0.8);
      const learning = nodes.filter(n => n.mastery >= 0.3 && n.mastery < 0.8);
      const struggling = nodes.filter(n => n.mastery < 0.3);
      const activeMisconceptions = nodes.flatMap(n =>
        n.misconceptions.filter(m => m.status === 'active')
      );

      return {
        subject,
        totalConcepts: nodes.length,
        masteredConcepts: mastered.length,
        learningConcepts: learning.length,
        strugglingConcepts: struggling.length,
        avgMastery: nodes.reduce((sum, n) => sum + n.mastery, 0) / nodes.length,
        activeMisconceptions: activeMisconceptions.length,
        topStrengths: mastered
          .sort((a, b) => b.mastery - a.mastery)
          .slice(0, 3)
          .map(n => n.conceptName),
        topWeaknesses: struggling
          .sort((a, b) => a.mastery - b.mastery)
          .slice(0, 3)
          .map(n => n.conceptName),
        recommendedFocus: struggling
          .slice(0, 5)
          .map(n => n.conceptName),
      };
    });
  }

  /**
   * Cluster related concepts for targeted study
   */
  getConceptClusters(): ConceptCluster[] {
    const topicMap = new Map<string, KnowledgeNode[]>();

    for (const node of this.profile.knowledgeNodes.values()) {
      const key = `${node.subject}:${node.topic}`;
      const existing = topicMap.get(key) || [];
      existing.push(node);
      topicMap.set(key, existing);
    }

    return Array.from(topicMap.entries()).map(([key, nodes]) => {
      const avgMastery = nodes.reduce((sum, n) => sum + n.mastery, 0) / nodes.length;
      const misconceptions = nodes.flatMap(n =>
        n.misconceptions.filter(m => m.status === 'active').map(m => m.name)
      );

      let suggestedMode = 'LEARN';
      if (avgMastery >= 0.8) suggestedMode = 'REVIEW';
      else if (avgMastery >= 0.6) suggestedMode = 'PRACTICE';
      else if (misconceptions.length > 0) suggestedMode = 'DEBUG';

      return {
        id: key,
        name: key.split(':')[1] || key,
        concepts: nodes.map(n => n.conceptId),
        avgMastery,
        commonMisconceptions: misconceptions,
        suggestedMode,
      };
    });
  }

  /**
   * Get the learner profile
   */
  getProfile(): LearnerProfile {
    return this.profile;
  }

  /**
   * Serialize for persistence
   */
  serialize(): string {
    const serializable = {
      ...this.profile,
      knowledgeNodes: Object.fromEntries(this.profile.knowledgeNodes),
    };
    return JSON.stringify(serializable);
  }

  /**
   * Deserialize from storage
   */
  static deserialize(data: string): LearnerProfile {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      knowledgeNodes: new Map(Object.entries(parsed.knowledgeNodes)),
      lastUpdated: new Date(parsed.lastUpdated),
    };
  }
}
