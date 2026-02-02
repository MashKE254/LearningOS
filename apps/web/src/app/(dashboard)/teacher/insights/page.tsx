'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Target,
  BookOpen,
  Clock,
  ChevronRight,
  BarChart3,
  Lightbulb,
  Award,
  RefreshCw,
  Filter,
  Calendar,
} from 'lucide-react';

// Mock data
const mockClassStats = [
  {
    id: '1',
    name: 'Grade 8 Mathematics',
    avgMastery: 72,
    trend: +5,
    activeRate: 87,
    strugglingCount: 4,
    topTopic: 'Linear Functions',
    bottomTopic: 'Quadratic Equations',
  },
  {
    id: '2',
    name: 'Grade 7 Science',
    avgMastery: 68,
    trend: -2,
    activeRate: 78,
    strugglingCount: 6,
    topTopic: 'Cell Biology',
    bottomTopic: 'Chemical Reactions',
  },
  {
    id: '3',
    name: 'Grade 9 Physics',
    avgMastery: 75,
    trend: +3,
    activeRate: 80,
    strugglingCount: 3,
    topTopic: 'Motion and Speed',
    bottomTopic: "Newton's Laws",
  },
];

const mockStrugglingStudents = [
  {
    id: '1',
    name: 'Sarah Johnson',
    class: 'Grade 8 Mathematics',
    classId: '1',
    mastery: 32,
    topic: 'Quadratic Equations',
    attempts: 12,
    daysStruggling: 8,
    recommendation: 'Schedule one-on-one session to identify specific misconceptions',
  },
  {
    id: '2',
    name: 'Michael Chen',
    class: 'Grade 7 Science',
    classId: '2',
    mastery: 28,
    topic: 'Chemical Reactions',
    attempts: 15,
    daysStruggling: 10,
    recommendation: 'Provide visual aids and hands-on experiments',
  },
  {
    id: '3',
    name: 'Anna Davis',
    class: 'Grade 9 Physics',
    classId: '3',
    mastery: 35,
    topic: "Newton's Laws",
    attempts: 8,
    daysStruggling: 5,
    recommendation: 'Review prerequisite concepts in motion and forces',
  },
  {
    id: '4',
    name: 'James Brown',
    class: 'Grade 8 Mathematics',
    classId: '1',
    mastery: 40,
    topic: 'Linear Functions',
    attempts: 6,
    daysStruggling: 4,
    recommendation: 'Focus on graphing practice with real-world examples',
  },
];

const mockTopicInsights = [
  {
    topic: 'Quadratic Equations',
    class: 'Grade 8 Mathematics',
    avgMastery: 52,
    studentsStruggling: 8,
    commonMistake: 'Incorrectly applying the quadratic formula signs',
    suggestion: 'Create step-by-step visual guide for formula application',
  },
  {
    topic: 'Chemical Reactions',
    class: 'Grade 7 Science',
    avgMastery: 48,
    studentsStruggling: 10,
    commonMistake: 'Confusing reactants and products',
    suggestion: 'Use interactive simulations to visualize reactions',
  },
  {
    topic: "Newton's Laws",
    class: 'Grade 9 Physics',
    avgMastery: 55,
    studentsStruggling: 6,
    commonMistake: 'Difficulty identifying forces in free-body diagrams',
    suggestion: 'Practice with physical demonstrations before abstract problems',
  },
];

const mockActionItems = [
  {
    id: '1',
    priority: 'high',
    title: '4 students need immediate intervention',
    description: 'Students have been struggling for over a week with less than 40% mastery',
    action: 'Review students',
    link: '#struggling',
  },
  {
    id: '2',
    priority: 'medium',
    title: 'Quadratic Equations topic needs attention',
    description: 'Class average is 52% - below the 70% target. Consider reviewing fundamentals.',
    action: 'View topic',
    link: '#topics',
  },
  {
    id: '3',
    priority: 'low',
    title: '6 students inactive for 3+ days',
    description: 'These students may need encouragement to maintain their learning streak.',
    action: 'Send reminder',
    link: '#inactive',
  },
];

const mockWeeklyTrends = [
  { week: 'Week 1', mastery: 62 },
  { week: 'Week 2', mastery: 65 },
  { week: 'Week 3', mastery: 68 },
  { week: 'Week 4', mastery: 72 },
];

export default function TeacherInsightsPage() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [timeRange, setTimeRange] = useState('week');

  const totalStudents = 85;
  const avgMastery = 72;
  const strugglingCount = mockStrugglingStudents.length;
  const activeRate = 82;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600">Data-driven recommendations to improve student outcomes</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Classes</option>
            {mockClassStats.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Recommended Actions
        </h2>
        <div className="space-y-3">
          {mockActionItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white/10 backdrop-blur rounded-lg p-4 flex items-center justify-between ${
                item.priority === 'high' ? 'border-l-4 border-red-400' :
                item.priority === 'medium' ? 'border-l-4 border-amber-400' :
                'border-l-4 border-blue-400'
              }`}
            >
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-emerald-100">{item.description}</p>
              </div>
              <button className="px-4 py-2 bg-white text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors flex items-center gap-1">
                {item.action}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{avgMastery}%</p>
              <p className="text-sm text-gray-600">Avg Mastery</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            +5% from last week
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{strugglingCount}</p>
              <p className="text-sm text-gray-600">Need Attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeRate}%</p>
              <p className="text-sm text-gray-600">Active Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Class Performance</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockClassStats.map((cls) => (
              <Link
                key={cls.id}
                href={`/teacher/classes/${cls.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{cls.name}</span>
                  <div className={`flex items-center gap-1 text-sm ${
                    cls.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {cls.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {cls.trend > 0 ? '+' : ''}{cls.trend}%
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cls.avgMastery >= 70 ? 'bg-green-500' :
                        cls.avgMastery >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cls.avgMastery}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-12 ${
                    cls.avgMastery >= 70 ? 'text-green-600' :
                    cls.avgMastery >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {cls.avgMastery}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{cls.activeRate}% active</span>
                  <span>{cls.strugglingCount} struggling</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Mastery Trend</h3>
          </div>
          <div className="p-4">
            <div className="h-48 flex items-end justify-between gap-4">
              {mockWeeklyTrends.map((week, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all"
                      style={{ height: `${week.mastery}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{week.week}</span>
                  <span className="text-sm font-medium text-gray-900">{week.mastery}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Insight:</strong> Overall mastery has improved by 10% over the past month. 
                Continue focusing on active learning strategies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Struggling Students */}
      <div id="struggling" className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Students Needing Intervention</h3>
            <p className="text-sm text-gray-500">Students struggling for extended periods</p>
          </div>
          <Link
            href="/teacher/students?status=struggling"
            className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {mockStrugglingStudents.map((student) => (
            <div key={student.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-medium">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/teacher/students/${student.id}`}
                      className="font-medium text-gray-900 hover:text-emerald-600"
                    >
                      {student.name}
                    </Link>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                      {student.daysStruggling} days struggling
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {student.class} • {student.topic} • {student.mastery}% mastery
                  </p>
                  <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">{student.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Insights */}
      <div id="topics" className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Topic Analysis</h3>
          <p className="text-sm text-gray-500">Topics with lowest mastery rates</p>
        </div>
        <div className="divide-y divide-gray-100">
          {mockTopicInsights.map((topic, idx) => (
            <div key={idx} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                  <p className="text-sm text-gray-500">{topic.class}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    topic.avgMastery >= 70 ? 'text-green-600' :
                    topic.avgMastery >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {topic.avgMastery}%
                  </p>
                  <p className="text-xs text-gray-500">{topic.studentsStruggling} struggling</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs font-medium text-red-700 mb-1">Common Mistake</p>
                  <p className="text-sm text-red-800">{topic.commonMistake}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs font-medium text-green-700 mb-1">Suggestion</p>
                  <p className="text-sm text-green-800">{topic.suggestion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          This Week's Focus Areas
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="p-2 bg-red-100 rounded-lg w-fit mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Intervention</h4>
            <p className="text-sm text-gray-600">
              4 students need immediate support. Schedule check-ins this week.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="p-2 bg-amber-100 rounded-lg w-fit mb-3">
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Review</h4>
            <p className="text-sm text-gray-600">
              Quadratic Equations needs class-wide review before moving forward.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg w-fit mb-3">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Celebrate</h4>
            <p className="text-sm text-gray-600">
              12 students achieved mastery milestones. Consider recognition!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
