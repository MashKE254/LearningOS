'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sun,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BookOpen,
  Clock,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  BarChart3,
  Flame,
  ThumbsUp,
} from 'lucide-react';

interface StudentAlert {
  id: string;
  name: string;
  avatar: string;
  type: 'struggling' | 'absent' | 'achievement' | 'inactive';
  message: string;
  subject?: string;
}

interface ClassInsight {
  id: string;
  type: 'misconception' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  affectedCount: number;
}

interface LearningNeed {
  id: string;
  topic: string;
  votes: number;
  status: 'open' | 'addressed';
  postedAgo: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  completionRate: number;
}

export default function TeacherMorningBrief() {
  const [alerts] = useState<StudentAlert[]>([
    {
      id: '1',
      name: 'Alex Chen',
      avatar: 'AC',
      type: 'struggling',
      message: 'Struggling with balancing equations - 3 failed attempts',
      subject: 'Chemical Equations',
    },
    {
      id: '2',
      name: 'Sarah Williams',
      avatar: 'SW',
      type: 'achievement',
      message: 'Completed all practice problems with 95% accuracy',
      subject: 'Stoichiometry',
    },
    {
      id: '3',
      name: 'Marcus Brown',
      avatar: 'MB',
      type: 'inactive',
      message: 'No activity in 5 days - may need check-in',
    },
  ]);

  const [insights] = useState<ClassInsight[]>([
    {
      id: '1',
      type: 'misconception',
      title: 'Common Error: Mole Calculations',
      description:
        '12 students are confusing molar mass with number of moles. Consider a quick review.',
      affectedCount: 12,
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Class Progress: Balancing Equations',
      description: '85% of the class has mastered basic balancing. Ready to move to complex equations.',
      affectedCount: 24,
    },
    {
      id: '3',
      type: 'suggestion',
      title: 'Recommended: Visual Aids',
      description:
        'Students who used the molecule visualizer had 40% better retention. Consider assigning it.',
      affectedCount: 28,
    },
  ]);

  const [learningNeeds] = useState<LearningNeed[]>([
    { id: '1', topic: 'When do I use Avogadro\'s number vs molar mass?', votes: 8, status: 'open', postedAgo: '2h' },
    { id: '2', topic: 'Help with limiting reagent problems', votes: 6, status: 'open', postedAgo: '1d' },
    { id: '3', topic: 'Confused about oxidation states', votes: 4, status: 'addressed', postedAgo: '3d' },
  ]);

  const [upcomingTasks] = useState<UpcomingTask[]>([
    { id: '1', title: 'Stoichiometry Quiz', dueDate: 'Tomorrow', completionRate: 65 },
    { id: '2', title: 'Lab Report: Titration', dueDate: 'Friday', completionRate: 40 },
    { id: '3', title: 'Chapter 5 Review', dueDate: 'Next Monday', completionRate: 20 },
  ]);

  const getAlertIcon = (type: StudentAlert['type']) => {
    switch (type) {
      case 'struggling':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'achievement':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'absent':
        return <Users className="w-4 h-4 text-red-500" />;
    }
  };

  const getInsightIcon = (type: ClassInsight['type']) => {
    switch (type) {
      case 'misconception':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'achievement':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Morning Brief Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sun className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Good Morning, Ms. Johnson</h2>
            <p className="text-emerald-100">Here's your daily brief for Period 3 Chemistry</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-3xl font-bold">28</div>
            <div className="text-emerald-100 text-sm">Total Students</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-3xl font-bold">18</div>
            <div className="text-emerald-100 text-sm">Active Today</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-3xl font-bold">85%</div>
            <div className="text-emerald-100 text-sm">Avg Completion</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-3xl font-bold">3</div>
            <div className="text-emerald-100 text-sm">Need Attention</div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200"
        >
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Student Alerts</h3>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
              {alerts.filter((a) => a.type === 'struggling').length} need help
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {alert.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{alert.name}</span>
                      {getAlertIcon(alert.type)}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{alert.message}</p>
                    {alert.subject && (
                      <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {alert.subject}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
            <Link
              href="/teacher/students"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View All Students
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200"
        >
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">AI Insights</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {insights.map((insight) => (
              <div key={insight.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Affects {insight.affectedCount} students
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Learning Needs Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200"
        >
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-500" />
              <h3 className="font-semibold text-gray-900">Learning Needs Board</h3>
            </div>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
              {learningNeeds.filter((n) => n.status === 'open').length} open
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {learningNeeds.map((need) => (
              <div key={need.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">&ldquo;{need.topic}&rdquo;</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{need.postedAgo} ago</span>
                      {need.status === 'addressed' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Addressed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded">
                    <ThumbsUp className="w-3 h-3 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{need.votes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
            <Link
              href="/teacher/needs"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
            >
              View All Needs
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200"
        >
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Upcoming Assignments</h3>
          </div>
          <div className="p-5 space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{task.title}</span>
                  <span className="text-sm text-gray-500">{task.dueDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${task.completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">
                    {task.completionRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200"
        >
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <Link
              href="/teacher/classroom"
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900">Live View</p>
                <p className="text-xs text-emerald-600">Monitor class</p>
              </div>
            </Link>
            <Link
              href="/teacher/rooms"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Student Rooms</p>
                <p className="text-xs text-blue-600">Create AI rooms</p>
              </div>
            </Link>
            <Link
              href="/teacher/materials"
              className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors"
            >
              <BookOpen className="w-6 h-6 text-violet-600" />
              <div>
                <p className="font-medium text-violet-900">Materials</p>
                <p className="text-xs text-violet-600">Upload content</p>
              </div>
            </Link>
            <Link
              href="/teacher/needs"
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <Lightbulb className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Address Needs</p>
                <p className="text-xs text-amber-600">Help students</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
