'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Child {
  id: string;
  name: string;
  email: string;
  grade: string;
  curriculum: string;
  learningStyle: string;
  dailyGoal: number;
  nativeLanguage: string;
  stats: {
    streak: number;
    longestStreak: number;
    totalTime: number;
    timeThisWeek: number;
    conceptsMastered: number;
    avgMastery: number;
    totalSessions: number;
    questionsAnswered: number;
    lastActive: string;
  };
  subscription: {
    plan: string;
    status: string;
    renewsAt: string;
  };
}

interface KnowledgeNode {
  id: string;
  concept: string;
  subject: string;
  mastery: number;
  lastReviewed: string;
  needsReview: boolean;
}

interface Activity {
  id: string;
  type: 'session' | 'milestone' | 'practice' | 'review';
  title: string;
  description: string;
  timestamp: string;
  duration?: number;
  score?: number;
}

export default function ChildDetailPage() {
  const params = useParams();
  const childId = params.id;
  
  const [child, setChild] = useState<Child | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeNode[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge' | 'activity'>('overview');

  useEffect(() => {
    // Mock data
    setChild({
      id: childId as string,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      grade: 'Grade 8',
      curriculum: 'Kenya CBC',
      learningStyle: 'Visual',
      dailyGoal: 30,
      nativeLanguage: 'English',
      stats: {
        streak: 12,
        longestStreak: 28,
        totalTime: 4320,
        timeThisWeek: 245,
        conceptsMastered: 34,
        avgMastery: 78,
        totalSessions: 156,
        questionsAnswered: 892,
        lastActive: '2 hours ago',
      },
      subscription: {
        plan: 'Student Pro',
        status: 'active',
        renewsAt: 'Feb 15, 2026',
      },
    });

    setKnowledge([
      { id: '1', concept: 'Quadratic Equations', subject: 'Mathematics', mastery: 65, lastReviewed: '2 hours ago', needsReview: true },
      { id: '2', concept: 'Photosynthesis', subject: 'Biology', mastery: 85, lastReviewed: '1 day ago', needsReview: false },
      { id: '3', concept: 'Chemical Bonding', subject: 'Chemistry', mastery: 72, lastReviewed: '3 days ago', needsReview: false },
      { id: '4', concept: 'Linear Equations', subject: 'Mathematics', mastery: 90, lastReviewed: '5 days ago', needsReview: false },
      { id: '5', concept: 'Cell Division', subject: 'Biology', mastery: 45, lastReviewed: '1 week ago', needsReview: true },
      { id: '6', concept: 'Essay Structure', subject: 'English', mastery: 88, lastReviewed: '2 days ago', needsReview: false },
    ]);

    setActivities([
      { id: '1', type: 'session', title: 'Math Practice', description: 'Worked on quadratic equations', timestamp: '2 hours ago', duration: 35, score: 75 },
      { id: '2', type: 'milestone', title: 'Achievement Unlocked', description: 'Reached 80% mastery in Photosynthesis', timestamp: '1 day ago' },
      { id: '3', type: 'practice', title: 'Quiz Completed', description: 'Chemistry - Chemical Bonding', timestamp: '1 day ago', score: 85 },
      { id: '4', type: 'session', title: 'English Writing', description: 'Essay structure practice', timestamp: '2 days ago', duration: 25, score: 90 },
      { id: '5', type: 'review', title: 'Spaced Review', description: 'Reviewed Linear Equations', timestamp: '3 days ago', score: 95 },
    ]);

    setLoading(false);
  }, [childId]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-500';
    if (mastery >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMasteryTextColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-400';
    if (mastery >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'session':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'milestone':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 'practice':
        return (
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'review':
        return (
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Child not found</p>
        <Link href="/parent/children" className="text-purple-400 hover:text-purple-300 mt-4 inline-block">
          ← Back to children
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/parent/children"
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{child.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{child.name}</h1>
            <p className="text-slate-400">{child.grade} • {child.curriculum}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <span className="text-sm text-slate-400">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-white">{child.stats.streak}</p>
          <p className="text-xs text-slate-500">Best: {child.stats.longestStreak} days</p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-slate-400">This Week</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatTime(child.stats.timeThisWeek)}</p>
          <p className="text-xs text-slate-500">Total: {formatTime(child.stats.totalTime)}</p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-sm text-slate-400">Mastered</span>
          </div>
          <p className="text-3xl font-bold text-white">{child.stats.conceptsMastered}</p>
          <p className="text-xs text-slate-500">concepts</p>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm text-slate-400">Avg Mastery</span>
          </div>
          <p className={`text-3xl font-bold ${getMasteryTextColor(child.stats.avgMastery)}`}>
            {child.stats.avgMastery}%
          </p>
          <p className="text-xs text-slate-500">{child.stats.questionsAnswered} questions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
        {(['overview', 'knowledge', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Info */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Learning Style</span>
                <span className="text-white">{child.learningStyle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Goal</span>
                <span className="text-white">{child.dailyGoal} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Language</span>
                <span className="text-white">{child.nativeLanguage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Sessions</span>
                <span className="text-white">{child.stats.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Active</span>
                <span className="text-white">{child.stats.lastActive}</span>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Subscription</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                child.subscription.plan === 'Free'
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {child.subscription.plan}
              </div>
              <span className={`text-sm ${
                child.subscription.status === 'active' ? 'text-green-400' : 'text-red-400'
              }`}>
                {child.subscription.status}
              </span>
            </div>
            {child.subscription.plan !== 'Free' && (
              <p className="text-sm text-slate-400">
                Renews on {child.subscription.renewsAt}
              </p>
            )}
            {child.subscription.plan === 'Free' && (
              <Link
                href="/pricing"
                className="inline-block mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Upgrade Plan
              </Link>
            )}
          </div>

          {/* Needs Review */}
          <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Needs Review</h3>
            {knowledge.filter(k => k.needsReview).length === 0 ? (
              <p className="text-slate-400">All caught up! No concepts need review.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {knowledge.filter(k => k.needsReview).map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{node.concept}</p>
                      <p className="text-sm text-slate-400">{node.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getMasteryTextColor(node.mastery)}`}>
                        {node.mastery}%
                      </p>
                      <p className="text-xs text-slate-500">{node.lastReviewed}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Knowledge Graph</h3>
          <div className="space-y-4">
            {knowledge.map((node) => (
              <div key={node.id} className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-white font-medium">{node.concept}</span>
                      <span className="text-slate-500 text-sm ml-2">({node.subject})</span>
                    </div>
                    <span className={`font-bold ${getMasteryTextColor(node.mastery)}`}>
                      {node.mastery}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getMasteryColor(node.mastery)}`}
                      style={{ width: `${node.mastery}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">Last reviewed: {node.lastReviewed}</span>
                    {node.needsReview && (
                      <span className="text-xs text-yellow-400">Needs review</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium">{activity.title}</p>
                    {activity.score !== undefined && (
                      <span className={`font-bold ${getMasteryTextColor(activity.score)}`}>
                        {activity.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{activity.description}</p>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                    <span>{activity.timestamp}</span>
                    {activity.duration && <span>• {activity.duration} min</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
