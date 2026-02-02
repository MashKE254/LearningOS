'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Child {
  id: string;
  name: string;
}

interface WeeklyReport {
  id: string;
  childId: string;
  childName: string;
  weekStart: string;
  weekEnd: string;
  summary: {
    totalTime: number;
    sessions: number;
    conceptsLearned: number;
    conceptsMastered: number;
    avgScore: number;
    streak: number;
  };
  subjects: {
    name: string;
    time: number;
    mastery: number;
    improvement: number;
  }[];
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
  highlights: {
    type: 'achievement' | 'struggle' | 'improvement';
    message: string;
  }[];
}

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const childFilter = searchParams.get('child');
  
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => {
    // Mock data
    setChildren([
      { id: '1', name: 'Alex' },
      { id: '2', name: 'Jamie' },
    ]);

    setReports([
      {
        id: 'report-1',
        childId: '1',
        childName: 'Alex',
        weekStart: 'Jan 20, 2026',
        weekEnd: 'Jan 26, 2026',
        summary: {
          totalTime: 245,
          sessions: 12,
          conceptsLearned: 8,
          conceptsMastered: 3,
          avgScore: 78,
          streak: 12,
        },
        subjects: [
          { name: 'Mathematics', time: 120, mastery: 72, improvement: 8 },
          { name: 'Biology', time: 65, mastery: 85, improvement: 12 },
          { name: 'Chemistry', time: 40, mastery: 68, improvement: 5 },
          { name: 'English', time: 20, mastery: 88, improvement: 3 },
        ],
        strengths: [
          'Strong grasp of biological concepts',
          'Consistent daily practice habit',
          'Good retention from spaced repetition',
        ],
        areasToImprove: [
          'Quadratic equations - struggling with factorization',
          'Chemical bonding types need more practice',
          'Time management during practice sessions',
        ],
        recommendations: [
          'Focus on 15 min of quadratic equation practice daily',
          'Review chemistry bonding videos before practice',
          'Try the Pomodoro technique for longer study sessions',
        ],
        highlights: [
          { type: 'achievement', message: 'Mastered Photosynthesis with 85% accuracy!' },
          { type: 'improvement', message: 'Math scores improved by 8% this week' },
          { type: 'struggle', message: 'Needs extra help with quadratic factorization' },
        ],
      },
      {
        id: 'report-2',
        childId: '2',
        childName: 'Jamie',
        weekStart: 'Jan 20, 2026',
        weekEnd: 'Jan 26, 2026',
        summary: {
          totalTime: 180,
          sessions: 8,
          conceptsLearned: 6,
          conceptsMastered: 2,
          avgScore: 65,
          streak: 5,
        },
        subjects: [
          { name: 'Mathematics', time: 90, mastery: 58, improvement: 4 },
          { name: 'Science', time: 50, mastery: 72, improvement: 10 },
          { name: 'English', time: 40, mastery: 70, improvement: 2 },
        ],
        strengths: [
          'Excellent at asking clarifying questions',
          'Shows curiosity about science topics',
          'Responds well to visual explanations',
        ],
        areasToImprove: [
          'Fractions and decimals conversion',
          'Sentence structure in writing',
          'Maintaining focus during longer sessions',
        ],
        recommendations: [
          'Use visual fraction manipulatives for practice',
          'Try shorter, more frequent study sessions (15 min each)',
          'Celebrate small wins to build confidence',
        ],
        highlights: [
          { type: 'improvement', message: 'Science mastery up 10% this week!' },
          { type: 'achievement', message: 'Completed 5-day streak!' },
          { type: 'struggle', message: 'Fraction word problems are challenging' },
        ],
      },
      {
        id: 'report-3',
        childId: '1',
        childName: 'Alex',
        weekStart: 'Jan 13, 2026',
        weekEnd: 'Jan 19, 2026',
        summary: {
          totalTime: 210,
          sessions: 10,
          conceptsLearned: 7,
          conceptsMastered: 2,
          avgScore: 70,
          streak: 5,
        },
        subjects: [
          { name: 'Mathematics', time: 100, mastery: 64, improvement: 6 },
          { name: 'Biology', time: 60, mastery: 73, improvement: 8 },
          { name: 'Chemistry', time: 35, mastery: 63, improvement: 4 },
          { name: 'English', time: 15, mastery: 85, improvement: 2 },
        ],
        strengths: [
          'Persistent problem-solver',
          'Good at connecting concepts across subjects',
        ],
        areasToImprove: [
          'Linear equation word problems',
          'Cell biology terminology',
        ],
        recommendations: [
          'Practice more word problems',
          'Create flashcards for biology terms',
        ],
        highlights: [
          { type: 'improvement', message: 'Overall mastery up 5% this week' },
          { type: 'struggle', message: 'Linear equations need more practice' },
        ],
      },
    ]);

    if (childFilter) {
      setSelectedChild(childFilter);
    }
    setLoading(false);
  }, [childFilter]);

  const filteredReports = selectedChild === 'all'
    ? reports
    : reports.filter(r => r.childId === selectedChild);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-400';
    if (mastery >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        );
      case 'improvement':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
      case 'struggle':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Weekly Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Detailed progress summaries for your children</p>
        </div>
        
        {/* Child Filter */}
        <select
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Children</option>
          {children.map((child) => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
          >
            {/* Report Header */}
            <button
              onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{report.childName.charAt(0)}</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white">{report.childName}</h3>
                  <p className="text-sm text-slate-400">{report.weekStart} - {report.weekEnd}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Quick Stats */}
                <div className="hidden sm:flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{formatTime(report.summary.totalTime)}</p>
                    <p className="text-xs text-slate-500">Time</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${getMasteryColor(report.summary.avgScore)}`}>
                      {report.summary.avgScore}%
                    </p>
                    <p className="text-xs text-slate-500">Avg Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">{report.summary.conceptsMastered}</p>
                    <p className="text-xs text-slate-500">Mastered</p>
                  </div>
                </div>
                
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${expandedReport === report.id ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedReport === report.id && (
              <div className="px-6 pb-6 border-t border-slate-800">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 py-6">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-white">{formatTime(report.summary.totalTime)}</p>
                    <p className="text-xs text-slate-500">Total Time</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-white">{report.summary.sessions}</p>
                    <p className="text-xs text-slate-500">Sessions</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-blue-400">{report.summary.conceptsLearned}</p>
                    <p className="text-xs text-slate-500">Learned</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-green-400">{report.summary.conceptsMastered}</p>
                    <p className="text-xs text-slate-500">Mastered</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className={`text-xl font-bold ${getMasteryColor(report.summary.avgScore)}`}>
                      {report.summary.avgScore}%
                    </p>
                    <p className="text-xs text-slate-500">Avg Score</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-orange-400">{report.summary.streak}</p>
                    <p className="text-xs text-slate-500">Day Streak</p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Week Highlights</h4>
                  <div className="space-y-2">
                    {report.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                        {getHighlightIcon(highlight.type)}
                        <p className="text-sm text-slate-300">{highlight.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subjects Breakdown */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Subject Breakdown</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {report.subjects.map((subject, idx) => (
                      <div key={idx} className="bg-slate-800/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{subject.name}</span>
                          <span className="text-sm text-slate-400">{formatTime(subject.time)}</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${subject.mastery >= 80 ? 'bg-green-500' : subject.mastery >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${subject.mastery}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getMasteryColor(subject.mastery)}`}>
                            {subject.mastery}%
                          </span>
                        </div>
                        <p className="text-xs text-green-400">+{subject.improvement}% this week</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Areas to Improve */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-3">Strengths</h4>
                    <ul className="space-y-2">
                      {report.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-400 mb-3">Areas to Improve</h4>
                    <ul className="space-y-2">
                      {report.areasToImprove.map((area, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-slate-300">
                          <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">AI Recommendations</h4>
                  <ul className="space-y-2">
                    {report.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-slate-300">
                        <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No reports yet</h3>
          <p className="text-slate-400">Reports are generated weekly based on your children's activity.</p>
        </div>
      )}

      {/* Email Subscription */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Get Reports in Your Inbox</h3>
              <p className="text-slate-300 text-sm">
                Receive weekly progress reports every Sunday at 9 AM.
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors whitespace-nowrap">
            Enable Email Reports
          </button>
        </div>
      </div>
    </div>
  );
}
