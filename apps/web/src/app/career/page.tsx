'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Briefcase,
  Target,
  Clock,
  TrendingUp,
  BookOpen,
  Code,
  Play,
  CheckCircle,
  ChevronRight,
  Flame,
  Award,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  progress: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  nextMilestone: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estimatedHours: number;
  completedHours: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface LearningPath {
  id: string;
  name: string;
  totalModules: number;
  completedModules: number;
  currentModule: string;
}

export default function CareerDashboard() {
  const [careerGoal, setCareerGoal] = useState<string>('Software Development');
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [thisWeekHours, setThisWeekHours] = useState<number>(6.5);
  const [streak, setStreak] = useState<number>(14);

  const [skills] = useState<Skill[]>([
    { id: '1', name: 'Python', progress: 65, level: 'intermediate', nextMilestone: 'Functions & OOP' },
    { id: '2', name: 'JavaScript', progress: 45, level: 'beginner', nextMilestone: 'DOM Manipulation' },
    { id: '3', name: 'SQL', progress: 30, level: 'beginner', nextMilestone: 'JOIN Queries' },
    { id: '4', name: 'React', progress: 20, level: 'beginner', nextMilestone: 'Components & Props' },
  ]);

  const [projects] = useState<Project[]>([
    {
      id: '1',
      title: 'Personal Portfolio Website',
      description: 'Build a responsive portfolio to showcase your work',
      skills: ['HTML', 'CSS', 'JavaScript'],
      estimatedHours: 15,
      completedHours: 8,
      status: 'in_progress',
    },
    {
      id: '2',
      title: 'Task Manager API',
      description: 'Create a RESTful API for task management',
      skills: ['Python', 'Flask', 'SQL'],
      estimatedHours: 20,
      completedHours: 0,
      status: 'not_started',
    },
  ]);

  const [learningPath] = useState<LearningPath>({
    id: '1',
    name: 'Full Stack Developer Path',
    totalModules: 24,
    completedModules: 6,
    currentModule: 'JavaScript Fundamentals',
  });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('career_onboarding');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.goal) setCareerGoal(data.goal);
        if (data.hoursPerWeek) setWeeklyHours(parseInt(data.hoursPerWeek));
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const weeklyProgress = Math.round((thisWeekHours / weeklyHours) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="font-semibold text-gray-900">EduForge</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              <span className="font-medium text-gray-900">Career Mode</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-lg">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">{streak} day streak</span>
            </div>
            <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">
              Continue Learning
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Your Path to {careerGoal}</h1>
              <p className="text-amber-100">
                Keep up the great work! You're making steady progress toward your goal.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{Math.round((learningPath.completedModules / learningPath.totalModules) * 100)}%</div>
              <p className="text-amber-100">Path Complete</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <Clock className="w-5 h-5 mb-2" />
              <div className="text-2xl font-bold">{thisWeekHours}h</div>
              <div className="text-amber-100 text-sm">This Week</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Target className="w-5 h-5 mb-2" />
              <div className="text-2xl font-bold">{weeklyProgress}%</div>
              <div className="text-amber-100 text-sm">Weekly Goal</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <BookOpen className="w-5 h-5 mb-2" />
              <div className="text-2xl font-bold">{learningPath.completedModules}</div>
              <div className="text-amber-100 text-sm">Modules Done</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Award className="w-5 h-5 mb-2" />
              <div className="text-2xl font-bold">{skills.length}</div>
              <div className="text-amber-100 text-sm">Skills in Progress</div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-200"
          >
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Continue Learning</h3>
              <p className="text-sm text-gray-500">{learningPath.name}</p>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Code className="w-8 h-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{learningPath.currentModule}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Module {learningPath.completedModules + 1} of {learningPath.totalModules}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full bg-amber-500" style={{ width: '35%' }} />
                    </div>
                    <span className="text-sm text-gray-500">35%</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              </div>

              {/* Upcoming in this module */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Up Next</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-500 line-through">Variables and Data Types</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-500 line-through">Operators and Expressions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500" />
                    <span className="text-gray-900 font-medium">Functions and Scope</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Current</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    <span className="text-gray-500">Arrays and Objects</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200"
          >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Skills Progress</h3>
              <Link href="/career/skills" className="text-sm text-amber-600 hover:text-amber-700">
                View All
              </Link>
            </div>
            <div className="p-5 space-y-4">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      skill.level === 'advanced'
                        ? 'bg-green-100 text-green-700'
                        : skill.level === 'intermediate'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-amber-500"
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{skill.progress}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Next: {skill.nextMilestone}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200"
        >
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Portfolio Projects</h3>
              <p className="text-sm text-gray-500">Build real projects to showcase your skills</p>
            </div>
            <Link
              href="/career/projects"
              className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              Browse Projects
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    project.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status === 'in_progress' ? 'In Progress' :
                     project.status === 'completed' ? 'Completed' : 'Not Started'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-amber-500"
                      style={{ width: `${(project.completedHours / project.estimatedHours) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {project.completedHours}/{project.estimatedHours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
