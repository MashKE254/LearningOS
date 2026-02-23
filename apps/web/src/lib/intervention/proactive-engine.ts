/**
 * Proactive Intervention Engine
 *
 * Unlike all competitors that only respond when asked,
 * EduForge initiates based on:
 * - Hesitation patterns
 * - Error patterns
 * - Procrastination detection
 * - Confidence divergence
 * - Engagement drop
 * - Time-based nudges
 */

export interface BehaviorSignal {
  type: BehaviorSignalType;
  intensity: number; // 0-1
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export type BehaviorSignalType =
  | 'hesitation' // Long pause before answering
  | 'rapid_wrong' // Quick wrong answers (guessing)
  | 'error_streak' // Multiple consecutive errors
  | 'engagement_drop' // Reduced interaction frequency
  | 'confidence_divergence' // Student vs AI confidence gap
  | 'procrastination' // Extended idle time during session
  | 'mode_avoidance' // Avoiding Debug/Exam mode despite need
  | 'time_of_day' // Studying at unusual/suboptimal times
  | 'frustration' // Rapid input changes, deletions
  | 'mastery_plateau' // No improvement over multiple sessions
  | 'review_overdue' // Spaced repetition review is overdue
  | 'streak_at_risk'; // Streak about to break

export interface Nudge {
  id: string;
  type: NudgeType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  detailedMessage?: string;
  suggestedAction?: NudgeAction;
  triggerSignals: BehaviorSignalType[];
  expiresAt: Date;
  deliveredAt?: Date;
  respondedAt?: Date;
  dismissed?: boolean;
}

export type NudgeType =
  | 'take_break'
  | 'try_different_mode'
  | 'review_reminder'
  | 'encouragement'
  | 'misconception_alert'
  | 'difficulty_adjustment'
  | 'study_suggestion'
  | 'streak_reminder'
  | 'confidence_check'
  | 'teacher_attention';

export interface NudgeAction {
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

export class ProactiveInterventionEngine {
  private signals: BehaviorSignal[] = [];
  private pendingNudges: Nudge[] = [];
  private deliveredNudges: Nudge[] = [];
  private lastNudgeTime: Date | null = null;

  // Minimum interval between nudges (don't overwhelm the student)
  private minNudgeInterval = 5 * 60 * 1000; // 5 minutes

  /**
   * Record a behavior signal
   */
  recordSignal(signal: BehaviorSignal): Nudge | null {
    this.signals.push(signal);

    // Keep only last 100 signals
    if (this.signals.length > 100) {
      this.signals = this.signals.slice(-100);
    }

    return this.evaluateSignals();
  }

  /**
   * Evaluate accumulated signals and generate nudges
   */
  private evaluateSignals(): Nudge | null {
    // Don't nudge too frequently
    if (this.lastNudgeTime && Date.now() - this.lastNudgeTime.getTime() < this.minNudgeInterval) {
      return null;
    }

    const recentSignals = this.signals.filter(
      s => Date.now() - s.timestamp.getTime() < 10 * 60 * 1000 // Last 10 minutes
    );

    // Check for each intervention pattern
    const nudge = this.checkHesitation(recentSignals)
      || this.checkErrorStreak(recentSignals)
      || this.checkFrustration(recentSignals)
      || this.checkEngagementDrop(recentSignals)
      || this.checkConfidenceDivergence(recentSignals)
      || this.checkProcrastination(recentSignals)
      || this.checkReviewOverdue(recentSignals)
      || this.checkStreakAtRisk(recentSignals)
      || this.checkMasteryPlateau(recentSignals);

    if (nudge) {
      this.pendingNudges.push(nudge);
      this.lastNudgeTime = new Date();
    }

    return nudge;
  }

  private checkHesitation(signals: BehaviorSignal[]): Nudge | null {
    const hesitations = signals.filter(s => s.type === 'hesitation' && s.intensity > 0.6);
    if (hesitations.length >= 3) {
      return {
        id: crypto.randomUUID(),
        type: 'try_different_mode',
        priority: 'medium',
        message: "I notice you're taking more time on these questions.",
        detailedMessage: "That's okay! Would you like to switch to Learn mode for a deeper explanation, or try some easier practice problems first?",
        suggestedAction: {
          label: 'Switch to Learn Mode',
          action: 'switch_mode',
          data: { mode: 'LEARN' },
        },
        triggerSignals: ['hesitation'],
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
    }
    return null;
  }

  private checkErrorStreak(signals: BehaviorSignal[]): Nudge | null {
    const errors = signals.filter(s => s.type === 'error_streak' && s.intensity > 0.5);
    if (errors.length >= 2) {
      return {
        id: crypto.randomUUID(),
        type: 'misconception_alert',
        priority: 'high',
        message: "It looks like there's a pattern in these errors.",
        detailedMessage: "Let's use Debug mode to understand exactly where your thinking diverges from the correct approach. It's the fastest way to fix this!",
        suggestedAction: {
          label: 'Open Debug Mode',
          action: 'switch_mode',
          data: { mode: 'DEBUG' },
        },
        triggerSignals: ['error_streak'],
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
    }
    return null;
  }

  private checkFrustration(signals: BehaviorSignal[]): Nudge | null {
    const frustrationSignals = signals.filter(s => s.type === 'frustration' && s.intensity > 0.7);
    if (frustrationSignals.length >= 2) {
      return {
        id: crypto.randomUUID(),
        type: 'take_break',
        priority: 'high',
        message: 'Learning is hard work. A short break might help.',
        detailedMessage: "Research shows that 5-10 minute breaks actually improve learning. When you come back, we'll approach this from a different angle.",
        suggestedAction: {
          label: 'Take a 5-minute Break',
          action: 'start_break',
          data: { duration: 5 },
        },
        triggerSignals: ['frustration'],
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      };
    }
    return null;
  }

  private checkEngagementDrop(signals: BehaviorSignal[]): Nudge | null {
    const drops = signals.filter(s => s.type === 'engagement_drop' && s.intensity > 0.5);
    if (drops.length >= 1) {
      return {
        id: crypto.randomUUID(),
        type: 'study_suggestion',
        priority: 'low',
        message: 'Want to switch things up?',
        detailedMessage: 'Sometimes a change of topic or mode can re-energize your study session. Try a quick review of something you already know well — that confidence boost can carry over!',
        suggestedAction: {
          label: 'Quick Review',
          action: 'switch_mode',
          data: { mode: 'REVIEW' },
        },
        triggerSignals: ['engagement_drop'],
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
    }
    return null;
  }

  private checkConfidenceDivergence(signals: BehaviorSignal[]): Nudge | null {
    const divSignals = signals.filter(s => s.type === 'confidence_divergence' && s.intensity > 0.6);
    if (divSignals.length >= 1) {
      const latest = divSignals[divSignals.length - 1];
      const isOverconfident = (latest.metadata.studentConfidence as number) > (latest.metadata.aiConfidence as number);

      if (isOverconfident) {
        return {
          id: crypto.randomUUID(),
          type: 'confidence_check',
          priority: 'medium',
          message: "Let's double-check your understanding.",
          detailedMessage: "You seem confident, which is great! But your recent answers suggest there might be some gaps. A quick targeted practice session can make sure your confidence is well-placed.",
          suggestedAction: {
            label: 'Take a Quick Quiz',
            action: 'start_quiz',
            data: { difficulty: 'challenging' },
          },
          triggerSignals: ['confidence_divergence'],
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        };
      } else {
        return {
          id: crypto.randomUUID(),
          type: 'encouragement',
          priority: 'medium',
          message: "You're doing better than you think!",
          detailedMessage: "Your recent performance has been strong, even if it doesn't feel that way. Trust the data — you've been getting most of these right!",
          triggerSignals: ['confidence_divergence'],
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        };
      }
    }
    return null;
  }

  private checkProcrastination(signals: BehaviorSignal[]): Nudge | null {
    const procSignals = signals.filter(s => s.type === 'procrastination' && s.intensity > 0.5);
    if (procSignals.length >= 1) {
      return {
        id: crypto.randomUUID(),
        type: 'study_suggestion',
        priority: 'low',
        message: "Ready to get started? Let's make it easy.",
        detailedMessage: "How about we start with just 5 minutes of review? Often the hardest part is beginning. Once you're in flow, you can keep going or stop — no pressure.",
        suggestedAction: {
          label: 'Start 5-Minute Review',
          action: 'start_timer',
          data: { duration: 5, mode: 'REVIEW' },
        },
        triggerSignals: ['procrastination'],
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    }
    return null;
  }

  private checkReviewOverdue(signals: BehaviorSignal[]): Nudge | null {
    const reviewSignals = signals.filter(s => s.type === 'review_overdue');
    if (reviewSignals.length >= 1) {
      const count = reviewSignals[0].metadata.overdueCount as number || 1;
      return {
        id: crypto.randomUUID(),
        type: 'review_reminder',
        priority: count > 5 ? 'high' : 'medium',
        message: `You have ${count} concept${count > 1 ? 's' : ''} due for review.`,
        detailedMessage: 'Spaced repetition is the most efficient way to lock knowledge into long-term memory. Even 5 minutes of review now will save you hours later.',
        suggestedAction: {
          label: 'Start Review',
          action: 'switch_mode',
          data: { mode: 'REVIEW' },
        },
        triggerSignals: ['review_overdue'],
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      };
    }
    return null;
  }

  private checkStreakAtRisk(signals: BehaviorSignal[]): Nudge | null {
    const streakSignals = signals.filter(s => s.type === 'streak_at_risk');
    if (streakSignals.length >= 1) {
      const currentStreak = streakSignals[0].metadata.currentStreak as number || 1;
      return {
        id: crypto.randomUUID(),
        type: 'streak_reminder',
        priority: currentStreak > 7 ? 'high' : 'medium',
        message: `Your ${currentStreak}-day streak is at risk!`,
        detailedMessage: `Just 5 minutes of quality study will keep your streak alive. You've worked hard to get to ${currentStreak} days — don't let it slip!`,
        suggestedAction: {
          label: 'Quick Study Session',
          action: 'start_timer',
          data: { duration: 5, mode: 'REVIEW' },
        },
        triggerSignals: ['streak_at_risk'],
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      };
    }
    return null;
  }

  private checkMasteryPlateau(signals: BehaviorSignal[]): Nudge | null {
    const plateauSignals = signals.filter(s => s.type === 'mastery_plateau' && s.intensity > 0.5);
    if (plateauSignals.length >= 1) {
      return {
        id: crypto.randomUUID(),
        type: 'difficulty_adjustment',
        priority: 'medium',
        message: "Let's try a different approach.",
        detailedMessage: "You've been working hard, but progress has plateaued. Sometimes approaching a concept from a different angle helps break through. Want to try Learn mode with a fresh explanation?",
        suggestedAction: {
          label: 'Fresh Start in Learn Mode',
          action: 'switch_mode',
          data: { mode: 'LEARN' },
        },
        triggerSignals: ['mastery_plateau'],
        expiresAt: new Date(Date.now() + 20 * 60 * 1000),
      };
    }
    return null;
  }

  /**
   * Mark a nudge as delivered
   */
  deliverNudge(nudgeId: string): void {
    const nudge = this.pendingNudges.find(n => n.id === nudgeId);
    if (nudge) {
      nudge.deliveredAt = new Date();
      this.pendingNudges = this.pendingNudges.filter(n => n.id !== nudgeId);
      this.deliveredNudges.push(nudge);
    }
  }

  /**
   * Mark a nudge as responded to or dismissed
   */
  respondToNudge(nudgeId: string, dismissed: boolean): void {
    const nudge = this.deliveredNudges.find(n => n.id === nudgeId);
    if (nudge) {
      nudge.respondedAt = new Date();
      nudge.dismissed = dismissed;
    }
  }

  getPendingNudges(): Nudge[] {
    const now = new Date();
    return this.pendingNudges.filter(n => n.expiresAt > now);
  }

  getDeliveredNudges(): Nudge[] {
    return this.deliveredNudges;
  }
}
