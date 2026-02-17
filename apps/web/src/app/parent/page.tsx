'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Flame,
  ChevronRight,
  Play,
  Calendar,
  Award,
  Brain,
} from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age: number;
  grade: string;
  avatar: string;
  subjects: SubjectProgress[];
  todayMinutes: number;
  weeklyMinutes: number;
  streak: number;
  lastActive: Date;
  alerts: Alert[];
}

interface SubjectProgress {
  name: string;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  recentScore: number;
  color: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'success' | 'info';
  message: string;
  timestamp: Date;
}

interface Activity {
  id: string;
  childId: string;
  childName: string;
  action: string;
  subject: string;
  timestamp: Date;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([
    {
      id: '1',
      name: 'Emma',
      age: 14,
      grade: 'Grade 9',
      avatar: 'E',
      subjects: [
        { name: 'Mathematics', progress: 72, trend: 'up', recentScore: 85, color: 'violet' },
        { name: 'Physics', progress: 65, trend: 'stable', recentScore: 78, color: 'blue' },
        { name: 'Chemistry', progress: 58, trend: 'down', recentScore: 62, color: 'emerald' },
      ],
      todayMinutes: 45,
      weeklyMinutes: 280,
      streak: 7,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      alerts: [
        {
          id: '1',
          type: 'warning',
          message: 'Chemistry grades declining - consider scheduling a focus session',
          timestamp: new Date(),
        },
      ],
    },
    {
      id: '2',
      name: 'James',
      age: 11,
      grade: 'Grade 6',
      avatar: 'J',
      subjects: [
        { name: 'Mathematics', progress: 85, trend: 'up', recentScore: 92, color: 'violet' },
        { name: 'English', progress: 78, trend: 'up', recentScore: 88, color: 'pink' },
        { name: 'Science', progress: 80, trend: 'stable', recentScore: 85, color: 'cyan' },
      ],
      todayMinutes: 30,
      weeklyMinutes: 200,
      streak: 12,
      lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      alerts: [
        {
          id: '2',
          type: 'success',
          message: 'Completed weekly math goal early!',
          timestamp: new Date(),
        },
      ],
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<Activity[]>([
    {
      id: '1',
      childId: '2',
      childName: 'James',
      action: 'Completed practice session',
      subject: 'Mathematics',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '2',
      childId: '1',
      childName: 'Emma',
      action: 'Started new topic',
      subject: 'Integration by Parts',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '3',
      childId: '2',
      childName: 'James',
      action: 'Earned achievement',
      subject: 'Math Wizard Badge',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);

  const totalStudyTime = children.reduce((acc, c) => acc + c.todayMinutes, 0);
  const totalWeeklyTime = children.reduce((acc, c) => acc + c.weeklyMinutes, 0);
  const avgStreak = Math.round(
    children.reduce((acc, c) => acc + c.streak, 0) / children.length
  );

  const formatTimeAgo = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 flex items-center justify-center text-gray-400">―</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Today's Study Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalStudyTime} min</div>
          <p className="text-xs text-gray-500 mt-1">Across all children</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Weekly Progress</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalWeeklyTime} min</div>
          <div className="flex items-center gap-1 mt-1">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${Math.min((totalWeeklyTime / 600) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">of 10h goal</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Average Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgStreak} days</div>
          <p className="text-xs text-gray-500 mt-1">Keep it going!</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-sm text-gray-500">AI Insights</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">2</div>
          <p className="text-xs text-gray-500 mt-1">Action items for you</p>
        </motion.div>
      </div>

      {/* Children Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child, index) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Child Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {child.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-500">
                      {child.grade} • {child.age} years old
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-4 h-4" />
                    <span className="font-medium">{child.streak} day streak</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Active {formatTimeAgo(child.lastActive)}
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {child.alerts.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                {child.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-2 text-sm ${
                      alert.type === 'warning'
                        ? 'text-amber-700'
                        : alert.type === 'success'
                        ? 'text-green-700'
                        : 'text-blue-700'
                    }`}
                  >
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Subjects */}
            <div className="p-5 space-y-4">
              {child.subjects.map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{subject.name}</span>
                      {getTrendIcon(subject.trend)}
                    </div>
                    <span className="text-sm text-gray-500">
                      Recent: {subject.recentScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${subject.color}-500`}
                        style={{
                          width: `${subject.progress}%`,
                          backgroundColor:
                            subject.color === 'violet'
                              ? '#8b5cf6'
                              : subject.color === 'blue'
                              ? '#3b82f6'
                              : subject.color === 'emerald'
                              ? '#10b981'
                              : subject.color === 'pink'
                              ? '#ec4899'
                              : '#06b6d4',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12">
                      {subject.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-5 py-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Today: {child.todayMinutes} min</span>
              </div>
              <Link
                href={`/parent/children/${child.id}`}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                  {activity.childName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.childName}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.subject}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 text-center">
            <Link
              href="/parent/activity"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Activity
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Schedule Session</p>
                <p className="text-xs text-gray-500">Book a tutoring session</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Set Goal</p>
                <p className="text-xs text-gray-500">Create a learning goal</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-xs text-gray-500">Weekly progress reports</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
