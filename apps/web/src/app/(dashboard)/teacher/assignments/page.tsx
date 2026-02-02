'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Calendar,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  X,
} from 'lucide-react';

// Mock data
const mockAssignments = [
  {
    id: '1',
    title: 'Week 4: Quadratic Equations',
    class: 'Grade 8 Mathematics',
    classId: '1',
    dueDate: '2024-03-15',
    status: 'active',
    submissions: 28,
    totalStudents: 32,
    avgScore: 75,
    concepts: ['Quadratic Equations', 'Factoring'],
    createdAt: '2024-03-08',
  },
  {
    id: '2',
    title: 'Week 3: Linear Functions',
    class: 'Grade 8 Mathematics',
    classId: '1',
    dueDate: '2024-03-08',
    status: 'completed',
    submissions: 32,
    totalStudents: 32,
    avgScore: 82,
    concepts: ['Linear Functions', 'Graphing'],
    createdAt: '2024-03-01',
  },
  {
    id: '3',
    title: 'Cell Biology Quiz',
    class: 'Grade 7 Science',
    classId: '2',
    dueDate: '2024-03-12',
    status: 'active',
    submissions: 20,
    totalStudents: 28,
    avgScore: 68,
    concepts: ['Cell Structure', 'Cell Functions'],
    createdAt: '2024-03-05',
  },
  {
    id: '4',
    title: 'Forces and Motion',
    class: 'Grade 9 Physics',
    classId: '3',
    dueDate: '2024-03-18',
    status: 'draft',
    submissions: 0,
    totalStudents: 25,
    avgScore: 0,
    concepts: ["Newton's Laws", 'Force Diagrams'],
    createdAt: '2024-03-10',
  },
  {
    id: '5',
    title: 'Week 2: Algebraic Expressions',
    class: 'Grade 8 Mathematics',
    classId: '1',
    dueDate: '2024-03-01',
    status: 'completed',
    submissions: 30,
    totalStudents: 32,
    avgScore: 78,
    concepts: ['Algebraic Expressions', 'Simplification'],
    createdAt: '2024-02-22',
  },
];

const mockClasses = [
  { id: '1', name: 'Grade 8 Mathematics' },
  { id: '2', name: 'Grade 7 Science' },
  { id: '3', name: 'Grade 9 Physics' },
];

type FilterStatus = 'all' | 'active' | 'completed' | 'draft';

export default function TeacherAssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredAssignments = mockAssignments.filter((assignment) => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || assignment.classId === selectedClass;
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      default: return null;
    }
  };

  // Stats
  const activeCount = mockAssignments.filter(a => a.status === 'active').length;
  const completedCount = mockAssignments.filter(a => a.status === 'completed').length;
  const draftCount = mockAssignments.filter(a => a.status === 'draft').length;
  const avgCompletion = Math.round(
    mockAssignments
      .filter(a => a.status !== 'draft')
      .reduce((sum, a) => sum + (a.submissions / a.totalStudents * 100), 0) / 
    mockAssignments.filter(a => a.status !== 'draft').length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Create and manage assignments for your classes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Edit className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
              <p className="text-sm text-gray-600">Drafts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgCompletion}%</p>
              <p className="text-sm text-gray-600">Avg Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Classes</option>
              {mockClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 lg:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/teacher/assignments/${assignment.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                      {assignment.title}
                    </Link>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      {assignment.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <Link
                      href={`/teacher/classes/${assignment.classId}`}
                      className="hover:text-emerald-600"
                    >
                      {assignment.class}
                    </Link>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {assignment.dueDate}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {assignment.concepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === assignment.id ? null : assignment.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {activeMenu === assignment.id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                      <Link
                        href={`/teacher/assignments/${assignment.id}`}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        View Submissions
                      </Link>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Assignment
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              {assignment.status !== 'draft' && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-bold text-gray-900">
                        {assignment.submissions}/{assignment.totalStudents}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Submitted</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {Math.round(assignment.submissions / assignment.totalStudents * 100)}%
                    </div>
                    <p className="text-xs text-gray-500">Completion</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      assignment.avgScore >= 80 ? 'text-green-600' :
                      assignment.avgScore >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {assignment.avgScore > 0 ? `${assignment.avgScore}%` : '-'}
                    </div>
                    <p className="text-xs text-gray-500">Avg Score</p>
                  </div>
                </div>
              )}

              {/* Progress bar for active assignments */}
              {assignment.status === 'active' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Submission Progress</span>
                    <span>{Math.round(assignment.submissions / assignment.totalStudents * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredAssignments.length === 0 && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No assignments found matching your filters</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Create your first assignment
            </button>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Assignment</h2>
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
                  Assignment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Week 5: Quadratic Equations"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select a class</option>
                  {mockClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Concepts to Cover
                </label>
                <input
                  type="text"
                  placeholder="e.g., Quadratic Equations, Factoring"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate concepts with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Instructions for students..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="notify" className="rounded text-emerald-500" />
                <label htmlFor="notify" className="text-sm text-gray-600">
                  Notify students via email
                </label>
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
                  type="button"
                  className="flex-1 py-2 border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
