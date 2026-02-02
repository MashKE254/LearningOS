'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
} from 'lucide-react';

// Mock data
const mockAssignment = {
  id: '1',
  title: 'Week 4: Quadratic Equations',
  class: 'Grade 8 Mathematics',
  classId: '1',
  dueDate: '2024-03-15',
  status: 'active',
  description: 'Complete practice problems on solving quadratic equations using factoring, completing the square, and the quadratic formula.',
  concepts: ['Quadratic Equations', 'Factoring', 'Quadratic Formula'],
  createdAt: '2024-03-08',
  stats: {
    totalStudents: 32,
    submitted: 28,
    graded: 22,
    avgScore: 75,
    highScore: 98,
    lowScore: 45,
  },
};

const mockSubmissions = [
  { id: '1', studentId: '1', name: 'Alex Kim', submittedAt: '2024-03-14 09:30', score: 92, status: 'graded', timeSpent: 25 },
  { id: '2', studentId: '2', name: 'Sarah Johnson', submittedAt: '2024-03-14 14:15', score: 58, status: 'graded', timeSpent: 45 },
  { id: '3', studentId: '3', name: 'Michael Chen', submittedAt: '2024-03-13 16:45', score: 85, status: 'graded', timeSpent: 30 },
  { id: '4', studentId: '4', name: 'Emma Williams', submittedAt: '2024-03-14 11:20', score: 72, status: 'graded', timeSpent: 35 },
  { id: '5', studentId: '5', name: 'James Brown', submittedAt: '2024-03-15 08:00', score: null, status: 'pending', timeSpent: 40 },
  { id: '6', studentId: '6', name: 'Lisa Park', submittedAt: '2024-03-12 20:30', score: 98, status: 'graded', timeSpent: 22 },
  { id: '7', studentId: '7', name: 'David Lee', submittedAt: '2024-03-14 17:00', score: 78, status: 'graded', timeSpent: 28 },
  { id: '8', studentId: '8', name: 'Sophie Taylor', submittedAt: null, score: null, status: 'missing', timeSpent: null },
  { id: '9', studentId: '9', name: 'Tom Wilson', submittedAt: '2024-03-13 12:00', score: 88, status: 'graded', timeSpent: 32 },
  { id: '10', studentId: '10', name: 'Anna Davis', submittedAt: null, score: null, status: 'missing', timeSpent: null },
];

type FilterStatus = 'all' | 'graded' | 'pending' | 'missing';
type SortField = 'name' | 'submittedAt' | 'score';
type SortOrder = 'asc' | 'desc';

export default function AssignmentDetailPage() {
  const params = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredSubmissions = mockSubmissions
    .filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'submittedAt':
          if (!a.submittedAt && !b.submittedAt) comparison = 0;
          else if (!a.submittedAt) comparison = 1;
          else if (!b.submittedAt) comparison = -1;
          else comparison = a.submittedAt.localeCompare(b.submittedAt);
          break;
        case 'score':
          if (a.score === null && b.score === null) comparison = 0;
          else if (a.score === null) comparison = 1;
          else if (b.score === null) comparison = -1;
          else comparison = a.score - b.score;
          break;
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
      case 'graded': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'missing': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'missing': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const submittedCount = mockSubmissions.filter(s => s.status !== 'missing').length;
  const missingCount = mockSubmissions.filter(s => s.status === 'missing').length;
  const pendingCount = mockSubmissions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/teacher/assignments"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mockAssignment.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <Link
                href={`/teacher/classes/${mockAssignment.classId}`}
                className="hover:text-emerald-600"
              >
                {mockAssignment.class}
              </Link>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due: {mockAssignment.dueDate}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {mockAssignment.concepts.map((concept, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="w-4 h-4" />
            Remind
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {submittedCount}/{mockAssignment.stats.totalStudents}
              </p>
              <p className="text-sm text-gray-600">Submitted</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-gray-600">To Grade</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{missingCount}</p>
              <p className="text-sm text-gray-600">Missing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{mockAssignment.stats.avgScore}%</p>
              <p className="text-sm text-gray-600">Avg Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-500">Score Range</p>
            <p className="text-lg font-bold text-gray-900">
              {mockAssignment.stats.lowScore}% - {mockAssignment.stats.highScore}%
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {mockAssignment.description && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{mockAssignment.description}</p>
        </div>
      )}

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
        <div className="flex gap-2">
          {(['all', 'graded', 'pending', 'missing'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table */}
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
                  onClick={() => handleSort('submittedAt')}
                >
                  <div className="flex items-center gap-1">
                    Submitted <SortIcon field="submittedAt" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Time Spent
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center gap-1">
                    Score <SortIcon field="score" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/teacher/students/${submission.studentId}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
                        {submission.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 hover:text-emerald-600">
                        {submission.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize flex items-center gap-1 w-fit ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {submission.submittedAt || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {submission.timeSpent ? `${submission.timeSpent} min` : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {submission.score !== null ? (
                      <span className={`text-sm font-medium ${
                        submission.score >= 80 ? 'text-green-600' :
                        submission.score >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {submission.score}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {submission.status === 'pending' && (
                        <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                          Grade
                        </button>
                      )}
                      {submission.status === 'graded' && (
                        <button className="p-1 hover:bg-gray-100 rounded" title="View submission">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      {submission.status === 'missing' && (
                        <button className="p-1 hover:bg-gray-100 rounded" title="Send reminder">
                          <Mail className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button className="p-1 hover:bg-gray-100 rounded" title="Send message">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No submissions found</p>
          </div>
        )}
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Score Distribution</h3>
        <div className="space-y-3">
          {[
            { range: '90-100%', count: 3, color: 'bg-green-500' },
            { range: '80-89%', count: 4, color: 'bg-green-400' },
            { range: '70-79%', count: 6, color: 'bg-amber-400' },
            { range: '60-69%', count: 5, color: 'bg-amber-500' },
            { range: '50-59%', count: 3, color: 'bg-red-400' },
            { range: 'Below 50%', count: 1, color: 'bg-red-500' },
          ].map((bucket) => (
            <div key={bucket.range} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-24">{bucket.range}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bucket.color} rounded-full`}
                  style={{ width: `${(bucket.count / 22) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">{bucket.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
