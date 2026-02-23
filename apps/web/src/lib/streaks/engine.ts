'use client';

import {
  StreakState,
  StreakUpdate,
  STREAK_MILESTONES,
  QUALITY_THRESHOLDS,
  WeeklyGoal,
} from './types';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export class StreakEngine {
  private state: StreakState;

  constructor(existingState?: StreakState) {
    this.state = existingState || this.createInitialState();
    this.checkStreakStatus();
  }

  private createInitialState(): StreakState {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      streakFreezeAvailable: 1,
      streakFreezeUsedDates: [],
      todayQualityScore: 0,
      todayMisconceptionsCleared: 0,
      todayConceptsReviewed: 0,
      todayStudyMinutes: 0,
      todayDebugCompleted: false,
      milestones: STREAK_MILESTONES.map(m => ({ ...m })),
      nextMilestone: 3,
      weeklyGoal: {
        targetDays: 5,
        targetMinutes: 20,
        targetConcepts: 5,
        currentDays: 0,
        currentMinutes: 0,
        currentConcepts: 0,
        weekStart: getWeekStart(),
      },
    };
  }

  /**
   * Check if streak should continue, break, or freeze
   */
  private checkStreakStatus(): StreakUpdate | null {
    const today = getToday();

    if (!this.state.lastActiveDate) return null;

    const gapDays = daysBetween(this.state.lastActiveDate, today);

    if (gapDays <= 1) return null; // Same day or yesterday - streak is fine

    if (gapDays === 2) {
      // Missed one day - try to use streak freeze
      if (this.state.streakFreezeAvailable > 0) {
        this.state.streakFreezeAvailable--;
        const missedDay = new Date(new Date(this.state.lastActiveDate).getTime() + 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
        this.state.streakFreezeUsedDates.push(missedDay);
        return {
          type: 'streak_frozen',
          data: {
            missedDate: missedDay,
            freezesRemaining: this.state.streakFreezeAvailable,
            streakPreserved: this.state.currentStreak,
          },
          timestamp: new Date(),
        };
      }
    }

    // Streak broken
    if (gapDays > 1) {
      const previousStreak = this.state.currentStreak;
      this.state.currentStreak = 0;
      return {
        type: 'streak_broken',
        data: {
          previousStreak,
          daysGap: gapDays,
          message: previousStreak > 7
            ? "Don't worry! Research shows breaks can help consolidation. Let's start fresh!"
            : "Welcome back! Ready to build a new streak?",
        },
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Record study activity and update streak
   */
  recordActivity(params: {
    studyMinutes: number;
    conceptsReviewed: number;
    questionsCorrect: number;
    questionsAttempted: number;
    misconceptionsCleared: number;
    debugCompleted: boolean;
  }): StreakUpdate[] {
    const updates: StreakUpdate[] = [];
    const today = getToday();

    // Reset weekly goals if new week
    if (this.state.weeklyGoal.weekStart !== getWeekStart()) {
      this.state.weeklyGoal = {
        ...this.state.weeklyGoal,
        currentDays: 0,
        currentMinutes: 0,
        currentConcepts: 0,
        weekStart: getWeekStart(),
      };
    }

    // Update today's quality metrics
    this.state.todayStudyMinutes += params.studyMinutes;
    this.state.todayConceptsReviewed += params.conceptsReviewed;
    this.state.todayMisconceptionsCleared += params.misconceptionsCleared;
    if (params.debugCompleted) this.state.todayDebugCompleted = true;

    // Calculate quality score
    if (params.questionsAttempted > 0) {
      this.state.todayQualityScore = Math.min(1.0,
        (params.questionsCorrect / params.questionsAttempted) * 0.4 +
        Math.min(1, params.studyMinutes / 20) * 0.3 +
        Math.min(1, params.conceptsReviewed / 3) * 0.2 +
        (params.misconceptionsCleared > 0 ? 0.1 : 0)
      );
    }

    // Check if quality thresholds met for streak
    const qualityMet =
      this.state.todayStudyMinutes >= QUALITY_THRESHOLDS.minStudyMinutes &&
      this.state.todayConceptsReviewed >= QUALITY_THRESHOLDS.minConceptsReviewed &&
      this.state.todayQualityScore >= QUALITY_THRESHOLDS.qualityScoreThreshold;

    if (qualityMet && this.state.lastActiveDate !== today) {
      // New day of quality study
      if (this.state.lastActiveDate === '' || daysBetween(this.state.lastActiveDate, today) <= 2) {
        this.state.currentStreak += 1;
      } else {
        this.state.currentStreak = 1;
      }

      this.state.lastActiveDate = today;
      this.state.longestStreak = Math.max(this.state.longestStreak, this.state.currentStreak);

      updates.push({
        type: 'streak_maintained',
        data: {
          currentStreak: this.state.currentStreak,
          longestStreak: this.state.longestStreak,
          qualityScore: this.state.todayQualityScore,
        },
        timestamp: new Date(),
      });

      // Check milestones
      const milestone = this.state.milestones.find(
        m => m.streakCount === this.state.currentStreak && !m.achievedAt
      );
      if (milestone) {
        milestone.achievedAt = new Date();
        // Award streak freezes
        if (milestone.reward?.includes('streak freeze')) {
          const freezeCount = parseInt(milestone.reward.match(/\d+/)?.[0] || '1');
          this.state.streakFreezeAvailable += freezeCount;
        }
        const nextUnachieved = this.state.milestones.find(m => !m.achievedAt);
        if (nextUnachieved) this.state.nextMilestone = nextUnachieved.streakCount;

        updates.push({
          type: 'milestone_reached',
          data: {
            milestone: milestone.name,
            streakCount: milestone.streakCount,
            reward: milestone.reward,
            icon: milestone.icon,
          },
          timestamp: new Date(),
        });
      }

      // Update weekly goal
      this.state.weeklyGoal.currentDays += 1;
    }

    // Update weekly totals
    this.state.weeklyGoal.currentMinutes += params.studyMinutes;
    this.state.weeklyGoal.currentConcepts += params.conceptsReviewed;

    updates.push({
      type: 'weekly_goal_progress',
      data: {
        days: `${this.state.weeklyGoal.currentDays}/${this.state.weeklyGoal.targetDays}`,
        minutes: `${this.state.weeklyGoal.currentMinutes}/${this.state.weeklyGoal.targetMinutes * this.state.weeklyGoal.targetDays}`,
        concepts: `${this.state.weeklyGoal.currentConcepts}/${this.state.weeklyGoal.targetConcepts}`,
      },
      timestamp: new Date(),
    });

    // Quality bonus for Debug mode completion
    if (params.debugCompleted && params.misconceptionsCleared > 0) {
      updates.push({
        type: 'quality_bonus',
        data: {
          reason: 'misconception_cleared',
          message: `Cleared ${params.misconceptionsCleared} misconception(s)! That's real learning.`,
          bonusType: 'debug_complete',
        },
        timestamp: new Date(),
      });
    }

    return updates;
  }

  getState(): StreakState {
    return { ...this.state };
  }

  serialize(): string {
    return JSON.stringify(this.state);
  }

  static deserialize(data: string): StreakState {
    return JSON.parse(data);
  }
}
