'use client';

import { useState, useEffect } from 'react';
import { StreakEngine, StreakState, STREAK_MILESTONES } from '@/lib/streaks';

const STORAGE_KEY = 'eduforge_streaks';

export default function StreakWidget() {
  const [streakState, setStreakState] = useState<StreakState | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    let engine: StreakEngine;
    if (stored) {
      try {
        const state = StreakEngine.deserialize(stored);
        engine = new StreakEngine(state);
      } catch {
        engine = new StreakEngine();
      }
    } else {
      engine = new StreakEngine();
      // Seed with demo data
      engine.recordActivity({
        studyMinutes: 25,
        conceptsReviewed: 5,
        questionsCorrect: 8,
        questionsAttempted: 10,
        misconceptionsCleared: 1,
        debugCompleted: true,
      });
    }
    setStreakState(engine.getState());
    localStorage.setItem(STORAGE_KEY, engine.serialize());
  }, []);

  if (!streakState) return null;

  const progressToNext = streakState.nextMilestone > 0
    ? (streakState.currentStreak / streakState.nextMilestone) * 100
    : 100;

  const nextMilestone = STREAK_MILESTONES.find(m => m.streakCount === streakState.nextMilestone);

  const weeklyProgress = {
    days: streakState.weeklyGoal.currentDays / streakState.weeklyGoal.targetDays,
    minutes: streakState.weeklyGoal.currentMinutes / (streakState.weeklyGoal.targetMinutes * streakState.weeklyGoal.targetDays),
    concepts: streakState.weeklyGoal.currentConcepts / streakState.weeklyGoal.targetConcepts,
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Compact view */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{streakState.currentStreak}</span>
          </div>
          <div className="text-left">
            <p className="text-white font-medium text-sm">
              {streakState.currentStreak} day streak
            </p>
            <p className="text-slate-500 text-xs">
              {streakState.streakFreezeAvailable} freeze{streakState.streakFreezeAvailable !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streakState.todayQualityScore > 0 && (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
              Today: {Math.round(streakState.todayQualityScore * 100)}%
            </span>
          )}
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {showDetails && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-800">
          {/* Progress to next milestone */}
          <div className="pt-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Next milestone</span>
              <span className="text-slate-300">{nextMilestone?.name || 'Complete!'} ({streakState.nextMilestone} days)</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, progressToNext)}%` }}
              />
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">Weekly Goals</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-white">{streakState.weeklyGoal.currentDays}/{streakState.weeklyGoal.targetDays}</p>
                <p className="text-xs text-slate-500">Days</p>
                <div className="h-1 bg-slate-700 rounded-full mt-1.5">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, weeklyProgress.days * 100)}%` }} />
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-white">{streakState.weeklyGoal.currentMinutes}m</p>
                <p className="text-xs text-slate-500">Study</p>
                <div className="h-1 bg-slate-700 rounded-full mt-1.5">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, weeklyProgress.minutes * 100)}%` }} />
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-white">{streakState.weeklyGoal.currentConcepts}</p>
                <p className="text-xs text-slate-500">Concepts</p>
                <div className="h-1 bg-slate-700 rounded-full mt-1.5">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, weeklyProgress.concepts * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Today's quality */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-2">Today&apos;s Quality Metrics</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Study time</span>
                <span className="text-white">{streakState.todayStudyMinutes}m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Concepts</span>
                <span className="text-white">{streakState.todayConceptsReviewed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Misconceptions fixed</span>
                <span className="text-white">{streakState.todayMisconceptionsCleared}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Debug completed</span>
                <span className={streakState.todayDebugCompleted ? 'text-green-400' : 'text-slate-500'}>{streakState.todayDebugCompleted ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Milestones</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {STREAK_MILESTONES.slice(0, 5).map(milestone => {
                const achieved = streakState.milestones.find(
                  m => m.streakCount === milestone.streakCount && m.achievedAt
                );
                return (
                  <div
                    key={milestone.streakCount}
                    className={`flex-shrink-0 w-16 text-center p-2 rounded-lg ${
                      achieved ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-slate-800/50'
                    }`}
                  >
                    <p className={`text-lg ${achieved ? 'text-orange-400' : 'text-slate-600'}`}>
                      {milestone.streakCount}
                    </p>
                    <p className={`text-[10px] ${achieved ? 'text-orange-300' : 'text-slate-600'}`}>
                      {milestone.name.split(' ')[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Longest streak: {streakState.longestStreak} days</span>
            <span>Quality: streaks reward learning, not just showing up</span>
          </div>
        </div>
      )}
    </div>
  );
}
