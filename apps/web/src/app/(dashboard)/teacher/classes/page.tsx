'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  Plus,
  Search,
  MoreVertical,
  Settings,
  Trash2,
  Copy,
  X,
  AlertTriangle,
} from 'lucide-react';

// Mock data for demo
const mockClasses = [
  {
    id: '1',
    name: 'Grade 8 Mathematics',
    subject: 'Mathematics',
    description: 'Algebra, Geometry, and Number Theory',
    curriculum: 'Kenya CBC',
    studentCount: 32,
    avgMastery: 72,
    activeThisWeek: 28,
    strugglingCount: 4,
    totalSessions: 156,
    joinCode: 'MATH8A',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Grade 7 Science',
    subject: 'Science',
    description: 'Biology, Chemistry, and Physics fundamentals',
    curriculum: 'Kenya CBC',
    studentCount: 28,
    avgMastery: 68,
    activeThisWeek: 22,
    strugglingCount: 6,
    totalSessions: 134,
    joinCode: 'SCI7B',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Grade 9 Physics',
    subject: 'Physics',
    description: 'Mechanics, Waves, and Electricity',
    curriculum: 'Kenya CBC',
    studentCount: 25,
    avgMastery: 75,
    activeThisWeek: 20,
    strugglingCount: 3,
    totalSessions: 98,
    joinCode: 'PHY9C',
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'Grade 6 Mathematics',
    subject: 'Mathematics',
    description: 'Basic arithmetic and pre-algebra',
    curriculum: 'Kenya CBC',
    studentCount: 30,
    avgMastery: 78,
    activeThisWeek: 26,
    strugglingCount: 2,
    totalSessions: 145,
    joinCode: 'MATH6D',
    createdAt: '2024-02-10',
  },
];

const subjects = ['All Subjects', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English'];

export default function TeacherClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredClasses = mockClasses.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All Subjects' || cls.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setShowCodeModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Classes</h1>
          <p className="text-gray-600">Manage your classes and monitor student progress</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Classes Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Class Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <Link href={`/teacher/classes/${cls.id}`} className="flex-1">
                  <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-gray-500">{cls.description}</p>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === cls.id ? null : cls.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {activeMenu === cls.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                      <button
                        onClick={() => {
                          setShowCodeModal(cls.joinCode);
                          setActiveMenu(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Share Join Code
                      </button>
                      <Link
                        href={`/teacher/classes/${cls.id}/settings`}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Class Settings
                      </Link>
                      <button
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Class
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  {cls.subject}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {cls.curriculum}
                </span>
              </div>
            </div>

            {/* Class Stats */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{cls.studentCount}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-600" />
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
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{cls.activeThisWeek}</p>
                    <p className="text-xs text-gray-500">Active This Week</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${
                      cls.strugglingCount > 5 ? 'text-red-600' :
                      cls.strugglingCount > 2 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {cls.strugglingCount}
                    </p>
                    <p className="text-xs text-gray-500">Need Help</p>
                  </div>
                </div>
              </div>

              {/* Join Code */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Join Code</p>
                  <p className="font-mono font-bold text-gray-900">{cls.joinCode}</p>
                </div>
                <button
                  onClick={() => copyJoinCode(cls.joinCode)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy join code"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Class Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <Link
                href={`/teacher/classes/${cls.id}`}
                className="flex-1 py-2 text-center text-sm font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                View Class
              </Link>
              <Link
                href={`/teacher/classes/${cls.id}/assignments`}
                className="flex-1 py-2 text-center text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Assignments
              </Link>
            </div>
          </div>
        ))}

        {/* Create New Class Card */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
        >
          <div className="p-4 bg-emerald-100 rounded-full">
            <Plus className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">Create New Class</p>
            <p className="text-sm text-gray-500">Add a new class to your dashboard</p>
          </div>
        </button>
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Class</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Grade 8 Mathematics"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select a subject</option>
                  {subjects.slice(1).map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curriculum
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="kenya-cbc">Kenya CBC</option>
                  <option value="gcse">UK GCSE</option>
                  <option value="common-core">US Common Core</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the class..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Class Join Code</h2>
            <p className="text-gray-600 mb-4">Share this code with students to join the class</p>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <p className="text-3xl font-mono font-bold text-emerald-600">{showCodeModal}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCodeModal(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => copyJoinCode(showCodeModal)}
                className="flex-1 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
