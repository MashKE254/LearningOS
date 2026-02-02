'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Search,
  Plus,
  BookOpen,
  Target,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Mail,
  Copy,
  Settings,
} from 'lucide-react';

// Mock data
const mockClass = {
  id: '1',
  name: 'Grade 8 Mathematics',
  subject: 'Mathematics',
  description: 'Algebra, Geometry, and Number Theory',
  curriculum: 'Kenya CBC',
  joinCode: 'MATH8A',
  createdAt: '2024-01-15',
  stats: {
    totalStudents: 32,
    avgMastery: 72,
    activeThisWeek: 28,
    strugglingCount: 4,
    totalSessions: 156,
    avgSessionTime: 22,
    conceptsMastered: 45,
    totalConcepts: 68,
  },
};

const mockStudents = [
  { id: '1', name: 'Alex Kim', email: 'alex@example.com', mastery: 92, streak: 15, lastActive: '2 hours ago', status: 'active', sessionsThisWeek: 5 },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', mastery: 32, streak: 0, lastActive: '1 day ago', status: 'struggling', sessionsThisWeek: 2 },
  { id: '3', name: 'Michael Chen', email: 'michael@example.com', mastery: 78, streak: 8, lastActive: '30 min ago', status: 'active', sessionsThisWeek: 6 },
  { id: '4', name: 'Emma Williams', email: 'emma@example.com', mastery: 65, streak: 3, lastActive: '4 hours ago', status: 'active', sessionsThisWeek: 4 },
  { id: '5', name: 'James Brown', email: 'james@example.com', mastery: 40, streak: 1, lastActive: '6 hours ago', status: 'struggling', sessionsThisWeek: 3 },
  { id: '6', name: 'Lisa Park', email: 'lisa@example.com', mastery: 88, streak: 12, lastActive: '1 hour ago', status: 'active', sessionsThisWeek: 7 },
  { id: '7', name: 'David Lee', email: 'david@example.com', mastery: 75, streak: 6, lastActive: '3 hours ago', status: 'active', sessionsThisWeek: 4 },
  { id: '8', name: 'Sophie Taylor', email: 'sophie@example.com', mastery: 58, streak: 2, lastActive: '5 hours ago', status: 'at-risk', sessionsThisWeek: 2 },
  { id: '9', name: 'Tom Wilson', email: 'tom@example.com', mastery: 82, streak: 10, lastActive: '45 min ago', status: 'active', sessionsThisWeek: 5 },
  { id: '10', name: 'Anna Davis', email: 'anna@example.com', mastery: 35, streak: 0, lastActive: '3 days ago', status: 'inactive', sessionsThisWeek: 0 },
];

const mockTopics = [
  { id: '1', name: 'Quadratic Equations', mastery: 68, studentsStruggling: 4 },
  { id: '2', name: 'Linear Functions', mastery: 75, studentsStruggling: 2 },
  { id: '3', name: 'Geometry Basics', mastery: 82, studentsStruggling: 1 },
  { id: '4', name: 'Algebraic Expressions', mastery: 78, studentsStruggling: 3 },
  { id: '5', name: 'Number Theory', mastery: 62, studentsStruggling: 5 },
];

const mockAssignments = [
  { id: '1', title: 'Week 4: Quadratic Equations', dueDate: '2024-03-15', submissions: 28, total: 32, avgScore: 75 },
  { id: '2', title: 'Week 3: Linear Functions', dueDate: '2024-03-08', submissions: 32, total: 32, avgScore: 82 },
  { id: '3', title: 'Week 2: Algebraic Expressions', dueDate: '2024-03-01', submissions: 30, total: 32, avgScore: 78 },
];

type Tab = 'students' | 'topics' | 'assignments';
type SortField = 'name' | 'mastery' | 'streak' | 'lastActive';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'at-risk' | 'struggling' | 'inactive';

export default function ClassDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredStudents = mockStudents
    .filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'mastery':
          comparison = a.mastery - b.mastery;
          break;
        case 'streak':
          comparison = a.streak - b.streak;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'at-risk': return 'bg-amber-100 text-amber-700';
      case 'struggling': return 'bg-red-100 text-red-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/teacher/classes"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mockClass.name}</h1>
            <p className="text-gray-600">{mockClass.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                {mockClass.subject}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {mockClass.curriculum}
              </span>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-mono">
                Code: {mockClass.joinCode}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(mockClass.joinCode)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Code
          </button>
          <Link
            href={`/teacher/classes/${params.id}/settings`}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockClass.stats.totalStudents}</p>
              <p className="text-sm text-gray-600">Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{mockClass.stats.avgMastery}%</p>
              <p className="text-sm text-gray-600">Avg Mastery</p>
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
                {mockClass.stats.conceptsMastered}/{mockClass.stats.totalConcepts}
              </p>
              <p className="text-sm text-gray-600">Concepts Mastered</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{mockClass.stats.strugglingCount}</p>
              <p className="text-sm text-gray-600">Need Help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { id: 'students', label: 'Students', icon: Users },
            { id: 'topics', label: 'Topics', icon: BookOpen },
            { id: 'assignments', label: 'Assignments', icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
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
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Students</option>
              <option value="active">Active</option>
              <option value="at-risk">At Risk</option>
              <option value="struggling">Struggling</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Student <SortIcon field="name" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('mastery')}
                    >
                      <div className="flex items-center gap-1">
                        Mastery <SortIcon field="mastery" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('streak')}
                    >
                      <div className="flex items-center gap-1">
                        Streak <SortIcon field="streak" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Sessions
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Last Active
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/teacher/students/${student.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 hover:text-emerald-600">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.mastery >= 80 ? 'bg-green-500' :
                                student.mastery >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${student.mastery}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${
                            student.mastery >= 80 ? 'text-green-600' :
                            student.mastery >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {student.mastery}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-900">{student.streak}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{student.sessionsThisWeek} this week</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">{student.lastActive}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/teacher/students/${student.id}`}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                          >
                            View
                          </Link>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Mail className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {mockTopics.map((topic) => (
              <div key={topic.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{topic.name}</h3>
                  {topic.studentsStruggling > 0 && (
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                      {topic.studentsStruggling} struggling
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        topic.mastery >= 80 ? 'bg-green-500' :
                        topic.mastery >= 60 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${topic.mastery}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-12 text-right ${
                    topic.mastery >= 80 ? 'text-green-600' :
                    topic.mastery >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {topic.mastery}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link
              href={`/teacher/classes/${params.id}/assignments/new`}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
            {mockAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/teacher/assignments/${assignment.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                  <span className="text-sm text-gray-500">Due: {assignment.dueDate}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {assignment.submissions}/{assignment.total} submitted
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Avg score: {assignment.avgScore}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
