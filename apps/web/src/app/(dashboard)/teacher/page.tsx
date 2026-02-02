'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Target,
  Award,
  BarChart3,
} from 'lucide-react';

// Mock data for demo
const mockClasses = [
  {
    id: '1',
    name: 'Grade 8 Mathematics',
    subject: 'Mathematics',
    studentCount: 32,
    avgMastery: 72,
    activeToday: 18,
    strugglingCount: 4,
    recentActivity: '2 hours ago',
  },
  {
    id: '2',
    name: 'Grade 7 Science',
    subject: 'Science',
    studentCount: 28,
    avgMastery: 68,
    activeToday: 12,
    strugglingCount: 6,
    recentActivity: '30 minutes ago',
  },
  {
    id: '3',
    name: 'Grade 9 Physics',
    subject: 'Physics',
    studentCount: 25,
    avgMastery: 75,
    activeToday: 15,
    strugglingCount: 3,
    recentActivity: '1 hour ago',
  },
];

const mockStrugglingStudents = [
  {
    id: '1',
    name: 'Sarah Johnson',
    class: 'Grade 8 Mathematics',
    topic: 'Quadratic Equations',
    mastery: 32,
    attempts: 8,
    lastActive: '1 day ago',
  },
  {
    id: '2',
    name: 'Michael Chen',
    class: 'Grade 7 Science',
    topic: 'Chemical Reactions',
    mastery: 28,
    attempts: 12,
    lastActive: '3 hours ago',
  },
  {
    id: '3',
    name: 'Emma Williams',
    class: 'Grade 9 Physics',
    topic: 'Newton\'s Laws',
    mastery: 35,
    attempts: 6,
    lastActive: '2 days ago',
  },
  {
    id: '4',
    name: 'James Brown',
    class: 'Grade 8 Mathematics',
    topic: 'Linear Functions',
    mastery: 40,
    attempts: 5,
    lastActive: '4 hours ago',
  },
];

const mockRecentActivity = [
  {
    id: '1',
    type: 'session',
    student: 'Alex Kim',
    class: 'Grade 8 Mathematics',
    description: 'Completed 15-minute session on Algebra',
    score: 85,
    time: '10 minutes ago',
  },
  {
    id: '2',
    type: 'milestone',
    student: 'Lisa Park',
    class: 'Grade 7 Science',
    description: 'Mastered "Cell Biology" concept',
    time: '25 minutes ago',
  },
  {
    id: '3',
    type: 'assignment',
    student: 'David Lee',
    class: 'Grade 9 Physics',
    description: 'Submitted "Forces and Motion" assignment',
    score: 92,
    time: '1 hour ago',
  },
  {
    id: '4',
    type: 'struggle',
    student: 'Sarah Johnson',
    class: 'Grade 8 Mathematics',
    description: 'Struggling with Quadratic Equations (8 attempts)',
    time: '2 hours ago',
  },
  {
    id: '5',
    type: 'session',
    student: 'Tom Wilson',
    class: 'Grade 7 Science',
    description: 'Completed 20-minute session on Chemistry',
    score: 78,
    time: '3 hours ago',
  },
];

export default function TeacherOverviewPage() {
  const totalStudents = mockClasses.reduce((sum, c) => sum + c.studentCount, 0);
  const avgClassMastery = Math.round(
    mockClasses.reduce((sum, c) => sum + c.avgMastery, 0) / mockClasses.length
  );
  const totalStruggling = mockClasses.reduce((sum, c) => sum + c.strugglingCount, 0);
  const activeToday = mockClasses.reduce((sum, c) => sum + c.activeToday, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Monitor your classes and student progress</p>
        </div>
        <Link
          href="/teacher/classes/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Class
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgClassMastery}%</p>
              <p className="text-sm text-gray-600">Avg Mastery</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStruggling}</p>
              <p className="text-sm text-gray-600">Need Attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeToday}</p>
              <p className="text-sm text-gray-600">Active Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Classes Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Classes</h2>
            <Link
              href="/teacher/classes"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockClasses.map((cls) => (
              <Link
                key={cls.id}
                href={`/teacher/classes/${cls.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-500">{cls.subject}</p>
                  </div>
                  <span className="text-xs text-gray-500">{cls.recentActivity}</span>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{cls.studentCount}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${
                      cls.avgMastery >= 70 ? 'text-green-600' :
                      cls.avgMastery >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {cls.avgMastery}%
                    </p>
                    <p className="text-xs text-gray-500">Avg Mastery</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600">{cls.activeToday}</p>
                    <p className="text-xs text-gray-500">Active Today</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${
                      cls.strugglingCount > 5 ? 'text-red-600' :
                      cls.strugglingCount > 2 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {cls.strugglingCount}
                    </p>
                    <p className="text-xs text-gray-500">Struggling</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Struggling Students */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Need Attention</h2>
            <Link
              href="/teacher/insights"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Insights <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {mockStrugglingStudents.slice(0, 4).map((student) => (
              <Link
                key={student.id}
                href={`/teacher/students/${student.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-medium">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.class}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        {student.mastery}% mastery
                      </span>
                      <span className="text-xs text-gray-500">
                        {student.attempts} attempts
                      </span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      Struggling with: {student.topic}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-emerald-600 hover:text-emerald-700">
            View all
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {mockRecentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex items-start gap-4">
              <div className={`p-2 rounded-lg ${
                activity.type === 'session' ? 'bg-blue-100' :
                activity.type === 'milestone' ? 'bg-green-100' :
                activity.type === 'assignment' ? 'bg-purple-100' :
                'bg-amber-100'
              }`}>
                {activity.type === 'session' && <Clock className="w-4 h-4 text-blue-600" />}
                {activity.type === 'milestone' && <Award className="w-4 h-4 text-green-600" />}
                {activity.type === 'assignment' && <BookOpen className="w-4 h-4 text-purple-600" />}
                {activity.type === 'struggle' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.student}</span>
                  {' '}&middot;{' '}
                  <span className="text-gray-500">{activity.class}</span>
                </p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                {activity.score && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activity.score >= 80 ? 'bg-green-100 text-green-700' :
                    activity.score >= 60 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Score: {activity.score}%
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold">Ready to help struggling students?</h3>
            <p className="text-emerald-100">
              View AI-powered recommendations for personalized interventions
            </p>
          </div>
          <Link
            href="/teacher/insights"
            className="px-6 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Insights
          </Link>
        </div>
      </div>
    </div>
  );
}
