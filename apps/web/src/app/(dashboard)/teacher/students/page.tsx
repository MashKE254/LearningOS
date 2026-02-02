'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Mail,
  Filter,
  Download,
  Clock,
} from 'lucide-react';

// Mock data
const mockStudents = [
  { id: '1', name: 'Alex Kim', email: 'alex@example.com', class: 'Grade 8 Mathematics', classId: '1', mastery: 92, streak: 15, lastActive: '2 hours ago', status: 'active', sessionsThisWeek: 5, totalTime: 185 },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', class: 'Grade 8 Mathematics', classId: '1', mastery: 32, streak: 0, lastActive: '1 day ago', status: 'struggling', sessionsThisWeek: 2, totalTime: 45 },
  { id: '3', name: 'Michael Chen', email: 'michael@example.com', class: 'Grade 7 Science', classId: '2', mastery: 78, streak: 8, lastActive: '30 min ago', status: 'active', sessionsThisWeek: 6, totalTime: 210 },
  { id: '4', name: 'Emma Williams', email: 'emma@example.com', class: 'Grade 9 Physics', classId: '3', mastery: 65, streak: 3, lastActive: '4 hours ago', status: 'active', sessionsThisWeek: 4, totalTime: 120 },
  { id: '5', name: 'James Brown', email: 'james@example.com', class: 'Grade 8 Mathematics', classId: '1', mastery: 40, streak: 1, lastActive: '6 hours ago', status: 'struggling', sessionsThisWeek: 3, totalTime: 75 },
  { id: '6', name: 'Lisa Park', email: 'lisa@example.com', class: 'Grade 7 Science', classId: '2', mastery: 88, streak: 12, lastActive: '1 hour ago', status: 'active', sessionsThisWeek: 7, totalTime: 245 },
  { id: '7', name: 'David Lee', email: 'david@example.com', class: 'Grade 9 Physics', classId: '3', mastery: 75, streak: 6, lastActive: '3 hours ago', status: 'active', sessionsThisWeek: 4, totalTime: 140 },
  { id: '8', name: 'Sophie Taylor', email: 'sophie@example.com', class: 'Grade 7 Science', classId: '2', mastery: 58, streak: 2, lastActive: '5 hours ago', status: 'at-risk', sessionsThisWeek: 2, totalTime: 65 },
  { id: '9', name: 'Tom Wilson', email: 'tom@example.com', class: 'Grade 8 Mathematics', classId: '1', mastery: 82, streak: 10, lastActive: '45 min ago', status: 'active', sessionsThisWeek: 5, totalTime: 165 },
  { id: '10', name: 'Anna Davis', email: 'anna@example.com', class: 'Grade 9 Physics', classId: '3', mastery: 35, streak: 0, lastActive: '3 days ago', status: 'inactive', sessionsThisWeek: 0, totalTime: 25 },
  { id: '11', name: 'Chris Martin', email: 'chris@example.com', class: 'Grade 7 Science', classId: '2', mastery: 71, streak: 5, lastActive: '2 hours ago', status: 'active', sessionsThisWeek: 4, totalTime: 130 },
  { id: '12', name: 'Olivia White', email: 'olivia@example.com', class: 'Grade 8 Mathematics', classId: '1', mastery: 85, streak: 9, lastActive: '1 hour ago', status: 'active', sessionsThisWeek: 6, totalTime: 195 },
];

const mockClasses = [
  { id: '1', name: 'Grade 8 Mathematics' },
  { id: '2', name: 'Grade 7 Science' },
  { id: '3', name: 'Grade 9 Physics' },
];

type SortField = 'name' | 'mastery' | 'streak' | 'totalTime' | 'class';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'at-risk' | 'struggling' | 'inactive';

export default function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
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

  const filteredStudents = mockStudents
    .filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === 'all' || student.classId === selectedClass;
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      return matchesSearch && matchesClass && matchesStatus;
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
        case 'totalTime':
          comparison = a.totalTime - b.totalTime;
          break;
        case 'class':
          comparison = a.class.localeCompare(b.class);
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
      case 'active': return 'bg-green-100 text-green-700';
      case 'at-risk': return 'bg-amber-100 text-amber-700';
      case 'struggling': return 'bg-red-100 text-red-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Stats
  const totalStudents = mockStudents.length;
  const activeStudents = mockStudents.filter(s => s.status === 'active').length;
  const strugglingStudents = mockStudents.filter(s => s.status === 'struggling' || s.status === 'at-risk').length;
  const avgMastery = Math.round(mockStudents.reduce((sum, s) => sum + s.mastery, 0) / totalStudents);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
          <p className="text-gray-600">View and manage students across all your classes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Quick Stats */}
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
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeStudents}</p>
              <p className="text-sm text-gray-600">Active This Week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{strugglingStudents}</p>
              <p className="text-sm text-gray-600">Need Attention</p>
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
              placeholder="Search by name or email..."
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
              <option value="at-risk">At Risk</option>
              <option value="struggling">Struggling</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
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
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('class')}
                >
                  <div className="flex items-center gap-1">
                    Class <SortIcon field="class" />
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
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalTime')}
                >
                  <div className="flex items-center gap-1">
                    Study Time <SortIcon field="totalTime" />
                  </div>
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
                    <Link
                      href={`/teacher/classes/${student.classId}`}
                      className="text-sm text-gray-600 hover:text-emerald-600"
                    >
                      {student.class}
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
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.totalTime} min</span>
                    </div>
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
                      <button className="p-1 hover:bg-gray-100 rounded" title="Send message">
                        <Mail className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No students found matching your filters</p>
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredStudents.length} of {mockStudents.length} students
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
