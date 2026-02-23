/**
 * Bidirectional Confidence Tracking
 *
 * No platform captures student self-assessment vs AI assessment.
 * EduForge detects divergence to enable targeted intervention:
 * - "You're confident but wrong" → overconfidence intervention
 * - "You're unsure but right" → encouragement + reinforcement
 */

export interface ConfidenceEntry {
  conceptId: string;
  conceptName: string;
  subject: string;
  studentConfidence: number; // 0-1 (student self-report)
  aiConfidence: number; // 0-1 (AI mastery estimate)
  actualCorrectness: boolean;
  timestamp: Date;
}

export interface ConfidenceDivergence {
  conceptId: string;
  conceptName: string;
  type: 'overconfident' | 'underconfident' | 'calibrated';
  studentConfidence: number;
  aiConfidence: number;
  divergence: number; // Absolute difference
  risk: 'high' | 'medium' | 'low';
  intervention: InterventionSuggestion;
}

export interface InterventionSuggestion {
  type: 'awareness' | 'encouragement' | 'challenge' | 'debug' | 'none';
  message: string;
  suggestedMode?: string;
  suggestedAction?: string;
}

export interface ConfidenceReport {
  userId: string;
  generatedAt: Date;

  // Overall calibration
  overallCalibration: number; // 0-1, 1 = perfectly calibrated
  avgStudentConfidence: number;
  avgAIConfidence: number;

  // Divergences by category
  overconfidentConcepts: ConfidenceDivergence[];
  underconfidentConcepts: ConfidenceDivergence[];
  calibratedConcepts: ConfidenceDivergence[];

  // Trends
  calibrationTrend: 'improving' | 'stable' | 'declining';
  historyPoints: { date: string; calibration: number }[];

  // Insights
  insights: string[];
  recommendations: string[];
}

export class BidirectionalConfidenceTracker {
  private entries: ConfidenceEntry[] = [];
  private userId: string;

  constructor(userId: string, existingEntries?: ConfidenceEntry[]) {
    this.userId = userId;
    if (existingEntries) this.entries = existingEntries;
  }

  /**
   * Record a confidence measurement
   */
  recordConfidence(entry: Omit<ConfidenceEntry, 'timestamp'>): ConfidenceDivergence {
    const fullEntry: ConfidenceEntry = {
      ...entry,
      timestamp: new Date(),
    };
    this.entries.push(fullEntry);

    return this.analyzeDivergence(fullEntry);
  }

  /**
   * Analyze divergence for a single entry
   */
  private analyzeDivergence(entry: ConfidenceEntry): ConfidenceDivergence {
    const divergence = entry.studentConfidence - entry.aiConfidence;
    const absDivergence = Math.abs(divergence);

    let type: ConfidenceDivergence['type'];
    let risk: ConfidenceDivergence['risk'];
    let intervention: InterventionSuggestion;

    if (divergence > 0.2) {
      // Student more confident than AI estimates
      type = 'overconfident';
      risk = absDivergence > 0.4 ? 'high' : absDivergence > 0.3 ? 'medium' : 'low';

      if (risk === 'high') {
        intervention = {
          type: 'awareness',
          message: `You seem very confident about ${entry.conceptName}, but your recent answers suggest there are gaps. Let's do some targeted practice to make sure your understanding is solid.`,
          suggestedMode: 'DEBUG',
          suggestedAction: 'Review recent mistakes on this topic',
        };
      } else if (risk === 'medium') {
        intervention = {
          type: 'challenge',
          message: `You're fairly confident about ${entry.conceptName}. Want to test that confidence with some harder problems?`,
          suggestedMode: 'PRACTICE',
          suggestedAction: 'Try harder difficulty level',
        };
      } else {
        intervention = {
          type: 'none',
          message: 'Slight confidence gap — keep practicing.',
        };
      }
    } else if (divergence < -0.2) {
      // AI more confident than student
      type = 'underconfident';
      risk = absDivergence > 0.4 ? 'high' : absDivergence > 0.3 ? 'medium' : 'low';

      if (risk === 'high') {
        intervention = {
          type: 'encouragement',
          message: `You know more about ${entry.conceptName} than you think! Your recent answers have been great. Trust yourself — you've got this.`,
          suggestedMode: 'PRACTICE',
          suggestedAction: 'Build confidence through practice',
        };
      } else if (risk === 'medium') {
        intervention = {
          type: 'encouragement',
          message: `Good news: your performance on ${entry.conceptName} is stronger than you might feel. Let's reinforce that with some review.`,
          suggestedMode: 'REVIEW',
          suggestedAction: 'Review to build confidence',
        };
      } else {
        intervention = {
          type: 'none',
          message: 'You're doing better than you think!',
        };
      }
    } else {
      type = 'calibrated';
      risk = 'low';
      intervention = {
        type: 'none',
        message: 'Your self-assessment matches your performance well.',
      };
    }

    return {
      conceptId: entry.conceptId,
      conceptName: entry.conceptName,
      type,
      studentConfidence: entry.studentConfidence,
      aiConfidence: entry.aiConfidence,
      divergence: absDivergence,
      risk,
      intervention,
    };
  }

  /**
   * Generate comprehensive confidence report
   */
  generateReport(): ConfidenceReport {
    const now = new Date();

    // Get latest entry per concept
    const latestByConceptMap = new Map<string, ConfidenceEntry>();
    for (const entry of this.entries) {
      const existing = latestByConceptMap.get(entry.conceptId);
      if (!existing || entry.timestamp > existing.timestamp) {
        latestByConceptMap.set(entry.conceptId, entry);
      }
    }
    const latestByConcept = Array.from(latestByConceptMap.values());

    // Analyze all divergences
    const divergences = latestByConcept.map(e => this.analyzeDivergence(e));

    const overconfident = divergences.filter(d => d.type === 'overconfident');
    const underconfident = divergences.filter(d => d.type === 'underconfident');
    const calibrated = divergences.filter(d => d.type === 'calibrated');

    // Calculate overall calibration (1 = perfect)
    const avgDivergence = divergences.length > 0
      ? divergences.reduce((sum, d) => sum + d.divergence, 0) / divergences.length
      : 0;
    const overallCalibration = Math.max(0, 1 - avgDivergence * 2);

    const avgStudentConfidence = latestByConcept.length > 0
      ? latestByConcept.reduce((sum, e) => sum + e.studentConfidence, 0) / latestByConcept.length
      : 0;
    const avgAIConfidence = latestByConcept.length > 0
      ? latestByConcept.reduce((sum, e) => sum + e.aiConfidence, 0) / latestByConcept.length
      : 0;

    // Generate trend (using last 30 days of data)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentEntries = this.entries.filter(e => e.timestamp >= thirtyDaysAgo);
    const weeklyCalibrations: { date: string; calibration: number }[] = [];

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (4 - i) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekEntries = recentEntries.filter(e => e.timestamp >= weekStart && e.timestamp < weekEnd);

      if (weekEntries.length > 0) {
        const weekAvgDiv = weekEntries.reduce(
          (sum, e) => sum + Math.abs(e.studentConfidence - e.aiConfidence), 0
        ) / weekEntries.length;
        weeklyCalibrations.push({
          date: weekStart.toISOString().split('T')[0],
          calibration: Math.max(0, 1 - weekAvgDiv * 2),
        });
      }
    }

    let calibrationTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (weeklyCalibrations.length >= 2) {
      const first = weeklyCalibrations[0].calibration;
      const last = weeklyCalibrations[weeklyCalibrations.length - 1].calibration;
      if (last - first > 0.05) calibrationTrend = 'improving';
      else if (first - last > 0.05) calibrationTrend = 'declining';
    }

    // Generate insights
    const insights: string[] = [];
    if (overconfident.length > 0) {
      insights.push(`You tend to overestimate your knowledge in ${overconfident.length} concept(s). This is common and Debug mode can help.`);
    }
    if (underconfident.length > 0) {
      insights.push(`You're underestimating yourself in ${underconfident.length} concept(s). Your performance is better than you think!`);
    }
    if (overallCalibration > 0.8) {
      insights.push('Excellent self-awareness! Your confidence matches your actual knowledge closely.');
    }

    const recommendations: string[] = [];
    if (overconfident.filter(d => d.risk === 'high').length > 0) {
      recommendations.push('Use Debug mode for topics where you feel confident but struggle on assessments.');
    }
    if (underconfident.filter(d => d.risk === 'high').length > 0) {
      recommendations.push('Try Exam mode to prove to yourself that you know the material.');
    }
    if (calibrationTrend === 'improving') {
      recommendations.push('Your self-awareness is improving! Keep reflecting on your confidence before and after questions.');
    }

    return {
      userId: this.userId,
      generatedAt: now,
      overallCalibration,
      avgStudentConfidence,
      avgAIConfidence,
      overconfidentConcepts: overconfident.sort((a, b) => b.divergence - a.divergence),
      underconfidentConcepts: underconfident.sort((a, b) => b.divergence - a.divergence),
      calibratedConcepts: calibrated,
      calibrationTrend,
      historyPoints: weeklyCalibrations,
      insights,
      recommendations,
    };
  }

  serialize(): string {
    return JSON.stringify(this.entries);
  }

  static deserialize(userId: string, data: string): BidirectionalConfidenceTracker {
    const entries = JSON.parse(data);
    return new BidirectionalConfidenceTracker(userId, entries);
  }
}
