'use client';

import { useState, useEffect } from 'react';

interface DailyProgress {
  date: string;
  minutes: number;
  sessions: number;
}

interface KnowledgeNode {
  id: string;
  concept: string;
  topic: string;
  mastery: number;
  lastReviewed: string;
  needsReview: boolean;
}

interface ProgressData {
  streak: number;
  longestStreak: number;
  totalMinutes: number;
  totalSessions: number;
  averageMastery: number;
  conceptsMastered: number;
  totalConcepts: number;
  dailyProgress: DailyProgress[];
  knowledgeNodes: KnowledgeNode[];
}

// Mock data for demonstration
const mockProgressData: ProgressData = {
  streak: 7,
  longestStreak: 14,
  totalMinutes: 1240,
  totalSessions: 45,
  averageMastery: 0.68,
  conceptsMastered: 24,
  totalConcepts: 42,
  dailyProgress: [
    { date: '2026-01-25', minutes: 45, sessions: 2 },
    { date: '2026-01-26', minutes: 30, sessions: 1 },
    { date: '2026-01-27', minutes: 60, sessions: 3 },
    { date: '2026-01-28', minutes: 25, sessions: 1 },
    { date: '2026-01-29', minutes: 55, sessions: 2 },
    { date: '2026-01-30', minutes: 40, sessions: 2 },
    { date: '2026-01-31', minutes: 35, sessions: 1 },
  ],
  knowledgeNodes: [
    { id: '1', concept: 'Quadratic Formula', topic: 'Algebra', mastery: 0.92, lastReviewed: '2026-01-31', needsReview: false },
    { id: '2', concept: 'Completing the Square', topic: 'Algebra', mastery: 0.78, lastReviewed: '2026-01-30', needsReview: false },
    { id: '3', concept: 'Factorization', topic: 'Algebra', mastery: 0.45, lastReviewed: '2026-01-25', needsReview: true },
    { id: '4', concept: 'Photosynthesis', topic: 'Biology', mastery: 0.85, lastReviewed: '2026-01-29', needsReview: false },
    { id: '5', concept: 'Cell Division', topic: 'Biology', mastery: 0.62, lastReviewed: '2026-01-28', needsReview: true },
    { id: '6', concept: 'Chemical Bonding', topic: 'Chemistry', mastery: 0.55, lastReviewed: '2026-01-27', needsReview: true },
  ],
};

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/student/progress?period=${timeRange}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error('Failed to fetch progress');
        
        const data = await res.json();
        setProgressData(data);
      } catch (error) {
        console.error('Error fetching progress:', error);
        // Use mock data as fallback
        setProgressData(mockProgressData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!progressData) return null;

  const maxMinutes = Math.max(...progressData.dailyProgress.map(d => d.minutes));

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Your Progress</h1>
            <p className="text-slate-400">Track your learning journey</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            {(['7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  timeRange === range 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{progressData.streak}</div>
                <div className="text-slate-500 text-sm">Day Streak</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Longest: {progressData.longestStreak} days
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.floor(progressData.totalMinutes / 60)}h {progressData.totalMinutes % 60}m
                </div>
                <div className="text-slate-500 text-sm">Time Studied</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {progressData.totalSessions} sessions
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{progressData.conceptsMastered}</div>
                <div className="text-slate-500 text-sm">Concepts Mastered</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              of {progressData.totalConcepts} total
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{Math.round(progressData.averageMastery * 100)}%</div>
                <div className="text-slate-500 text-sm">Avg Mastery</div>
              </div>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${progressData.averageMastery * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily activity chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Daily Activity</h2>
            <div className="flex items-end justify-between h-40 gap-2">
              {progressData.dailyProgress.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-400"
                    style={{ height: `${(day.minutes / maxMinutes) * 100}%`, minHeight: '4px' }}
                  />
                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge graph */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Knowledge Graph</h2>
              <span className="text-xs text-slate-500">
                {progressData.knowledgeNodes.filter(n => n.needsReview).length} need review
              </span>
            </div>
            <div className="space-y-3">
              {progressData.knowledgeNodes.map((node) => (
                <div key={node.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{node.concept}</span>
                      <span className={`text-xs font-medium ${
                        node.mastery >= 0.8 ? 'text-green-400' :
                        node.mastery >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {Math.round(node.mastery * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          node.mastery >= 0.8 ? 'bg-green-500' :
                          node.mastery >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${node.mastery * 100}%` }}
                      />
                    </div>
                  </div>
                  {node.needsReview && (
                    <span className="flex-none px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                      Review
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Concepts needing review */}
        {progressData.knowledgeNodes.some(n => n.needsReview) && (
          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-none">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-yellow-500 font-medium mb-1">Time to Review!</h3>
                <p className="text-yellow-200/70 text-sm mb-3">
                  These concepts might be fading. A quick review will help lock them in long-term memory.
                </p>
                <div className="flex flex-wrap gap-2">
                  {progressData.knowledgeNodes.filter(n => n.needsReview).map((node) => (
                    <span key={node.id} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
                      {node.concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
