/**
 * Streaks with Purpose - Pedagogical Gamification
 *
 * Unlike Duolingo's gamification-first approach (which has caused user backlash),
 * EduForge's streaks reward quality learning, not just quantity.
 * Streaks serve pedagogy, not vice versa.
 */

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakFreezeAvailable: number; // Number of streak freezes
  streakFreezeUsedDates: string[];

  // Quality metrics (streaks continue only if quality thresholds met)
  todayQualityScore: number; // 0-1
  todayMisconceptionsCleared: number;
  todayConceptsReviewed: number;
  todayStudyMinutes: number;
  todayDebugCompleted: boolean;

  // Milestones
  milestones: StreakMilestone[];
  nextMilestone: number;

  // Weekly goals
  weeklyGoal: WeeklyGoal;
}

export interface StreakMilestone {
  streakCount: number;
  name: string;
  icon: string;
  achievedAt?: Date;
  reward?: string;
}

export interface WeeklyGoal {
  targetDays: number; // Days per week (e.g., 5)
  targetMinutes: number; // Minutes per day
  targetConcepts: number; // Concepts to review
  currentDays: number;
  currentMinutes: number;
  currentConcepts: number;
  weekStart: string; // YYYY-MM-DD
}

export interface StreakUpdate {
  type: 'streak_maintained' | 'streak_broken' | 'streak_frozen' |
        'milestone_reached' | 'quality_bonus' | 'weekly_goal_progress';
  data: Record<string, unknown>;
  timestamp: Date;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { streakCount: 3, name: 'Getting Started', icon: 'seedling', reward: '1 streak freeze' },
  { streakCount: 7, name: 'One Week Strong', icon: 'fire', reward: '2 streak freezes' },
  { streakCount: 14, name: 'Two Week Champion', icon: 'star', reward: 'Custom avatar frame' },
  { streakCount: 30, name: 'Monthly Master', icon: 'trophy', reward: '3 streak freezes + badge' },
  { streakCount: 50, name: 'Knowledge Keeper', icon: 'crown', reward: 'Special tutor personality' },
  { streakCount: 100, name: 'Century Scholar', icon: 'diamond', reward: 'All streak freezes + title' },
  { streakCount: 365, name: 'Year of Learning', icon: 'medal', reward: 'Legendary badge' },
];

export const QUALITY_THRESHOLDS = {
  minStudyMinutes: 5, // At least 5 minutes of actual study
  minConceptsReviewed: 1, // Review at least 1 concept
  qualityScoreThreshold: 0.3, // Must attempt problems meaningfully
};
