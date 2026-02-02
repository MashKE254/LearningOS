'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  Award,
  Target,
  BookOpen,
  AlertTriangle,
  Calendar,
  Mail,
  MessageSquare,
  ChevronRight,
  Flame,
  BarChart3,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

// Mock data
const mockStudent = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  class: 'Grade 8 Mathematics',
  classId: '1',
  joinedAt: '2024-01-15',
  stats: {
    mastery: 32,
    streak: 0,
    longestStreak: 5,
    totalSessions: 24,
    totalTime: 185,
    timeThisWeek: 45,
    conceptsLearned: 12,
    conceptsMastered: 4,
    avgSessionTime: 8,
  },
  learningStyle: 'Visual',
  dailyGoal: 20,
  status: 'struggling',
};

const mockKnowledge = [
  { id: '1', concept: 'Linear Equations', topic: 'Algebra', mastery: 65, lastReviewed: '2 days ago', status: 'developing' },
  { id: '2', concept: 'Quadratic Equations', topic: 'Algebra', mastery: 25, lastReviewed: '1 day ago', status: 'struggling' },
  { id: '3', concept: 'Graphing Functions', topic: 'Algebra', mastery: 40, lastReviewed: '3 days ago', status: 'struggling' },
  { id: '4', concept: 'Basic Geometry', topic: 'Geometry', mastery: 78, lastReviewed: '1 week ago', status: 'developing' },
  { id: '5', concept: 'Area and Perimeter', topic: 'Geometry', mastery: 85, lastReviewed: '5 days ago', status: 'mastered' },
  { id: '6', concept: 'Fractions', topic: 'Arithmetic', mastery: 92, lastReviewed: '2 weeks ago', status: 'mastered' },
];

const mockActivity = [
  { id: '1', type: 'session', description: 'Completed 8-minute session on Quadratic Equations', score: 45, time: '1 day ago' },
  { id: '2', type: 'struggle', description: 'Multiple attempts on Quadratic Equations (8 tries)', time: '1 day ago' },
  { id: '3', type: 'session', description: 'Completed 12-minute session on Linear Equations', score: 72, time: '2 days ago' },
  { id: '4', type: 'assignment', description: 'Submitted Week 3 Assignment', score: 58, time: '3 days ago' },
  { id: '5', type: 'session', description: 'Completed 10-minute session on Graphing', score: 55, time: '4 days ago' },
];

const mockRecommendations = [
  {
    id: '1',
    type: 'intervention',
    title: 'One-on-One Support Recommended',
    description: 'Sarah has struggled with Quadratic Equations for over a week. Consider scheduling a brief check-in to identify specific difficulties.',
    priority: 'high',
  },
  {
    id: '2',
    type: 'resource',
    title: 'Provide Visual Learning Materials',
    description: 'Based on her learning style, visual aids and graphing exercises may help with understanding algebraic concepts.',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'practice',
    title: 'Focus on Foundational Concepts',
    description: 'Strengthening basics in Linear Equations before advancing to Quadratics may improve understanding.',
    priority: 'medium',
  },
];

type Tab = 'overview' | 'knowledge' | 'activity' | 'recommendations';

export default function TeacherStudentDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mastered': return 'bg-green-100 text-green-700';
      case 'developing': return 'bg-amber-100 text-amber-700';
      case 'struggling': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-600';
    if (mastery >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getMasteryBg = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-500';
    if (mastery >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/teacher/students"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
              {mockStudent.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mockStudent.name}</h1>
              <p className="text-gray-600">{mockStudent.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  href={`/teacher/classes/${mockStudent.classId}`}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  {mockStudent.class}
                </Link>
                <span className="text-gray-300">•</span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(mockStudent.status)}`}>
                  {mockStudent.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            <MessageSquare className="w-4 h-4" />
            Send Note
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${getMasteryColor(mockStudent.stats.mastery)}`}>
                {mockStudent.stats.mastery}%
              </p>
              <p className="text-sm text-gray-600">Avg Mastery</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockStudent.stats.streak}
                <span className="text-sm text-gray-400 font-normal ml-1">
                  / {mockStudent.stats.longestStreak} best
                </span>
              </p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockStudent.stats.timeThisWeek}
                <span className="text-sm text-gray-400 font-normal ml-1">min</span>
              </p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {mockStudent.stats.conceptsMastered}
                <span className="text-sm text-gray-400 font-normal ml-1">
                  / {mockStudent.stats.conceptsLearned}
                </span>
              </p>
              <p className="text-sm text-gray-600">Mastered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner for Struggling Students */}
      {mockStudent.status === 'struggling' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-800">This student needs attention</h3>
            <p className="text-sm text-amber-700 mt-1">
              Sarah has been struggling with Quadratic Equations for over a week and hasn't maintained a study streak. 
              Consider providing additional support or one-on-one guidance.
            </p>
          </div>
          <button className="text-sm text-amber-700 hover:text-amber-800 font-medium">
            View Recommendations
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'knowledge', label: 'Knowledge Map', icon: BookOpen },
            { id: 'activity', label: 'Activity', icon: Clock },
            { id: 'recommendations', label: 'AI Recommendations', icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Student Profile</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Learning Style</span>
                <span className="font-medium text-gray-900">{mockStudent.learningStyle}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Daily Goal</span>
                <span className="font-medium text-gray-900">{mockStudent.dailyGoal} minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Sessions</span>
                <span className="font-medium text-gray-900">{mockStudent.stats.totalSessions}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Avg Session Length</span>
                <span className="font-medium text-gray-900">{mockStudent.stats.avgSessionTime} min</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Study Time</span>
                <span className="font-medium text-gray-900">{mockStudent.stats.totalTime} min</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Joined</span>
                <span className="font-medium text-gray-900">{mockStudent.joinedAt}</span>
              </div>
            </div>
          </div>

          {/* Areas Needing Help */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Struggling Areas</h3>
            <div className="space-y-4">
              {mockKnowledge
                .filter(k => k.mastery < 60)
                .map((concept) => (
                  <div key={concept.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{concept.concept}</span>
                      <span className="text-sm text-red-600 font-medium">{concept.mastery}%</span>
                    </div>
                    <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${concept.mastery}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Last reviewed: {concept.lastReviewed}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Knowledge Map</h3>
            <p className="text-sm text-gray-600">Track mastery across all concepts</p>
          </div>
          <div className="divide-y divide-gray-100">
            {mockKnowledge.map((concept) => (
              <div key={concept.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-900">{concept.concept}</span>
                    <span className="text-sm text-gray-500 ml-2">• {concept.topic}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(concept.status)}`}>
                    {concept.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getMasteryBg(concept.mastery)}`}
                      style={{ width: `${concept.mastery}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-12 text-right ${getMasteryColor(concept.mastery)}`}>
                    {concept.mastery}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Last reviewed: {concept.lastReviewed}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockActivity.map((activity) => (
              <div key={activity.id} className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'session' ? 'bg-blue-100' :
                  activity.type === 'struggle' ? 'bg-red-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'session' && <Clock className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'struggle' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  {activity.type === 'assignment' && <BookOpen className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  {activity.score !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      activity.score >= 80 ? 'bg-green-100 text-green-700' :
                      activity.score >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Score: {activity.score}%
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">AI-Powered Recommendations</h3>
            <p className="text-emerald-100">
              Based on Sarah's learning patterns and struggles, here are personalized intervention strategies.
            </p>
          </div>

          {mockRecommendations.map((rec) => (
            <div
              key={rec.id}
              className={`bg-white rounded-xl p-6 shadow-sm border ${
                rec.priority === 'high' ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  rec.type === 'intervention' ? 'bg-red-100' :
                  rec.type === 'resource' ? 'bg-blue-100' :
                  'bg-green-100'
                }`}>
                  {rec.type === 'intervention' && <MessageSquare className="w-5 h-5 text-red-600" />}
                  {rec.type === 'resource' && <BookOpen className="w-5 h-5 text-blue-600" />}
                  {rec.type === 'practice' && <RefreshCw className="w-5 h-5 text-green-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    {rec.priority === 'high' && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                </div>
                <button className="text-emerald-600 hover:text-emerald-700">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
