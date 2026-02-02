'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Globe,
  FileText,
  Layers,
  Download,
  Upload,
  X,
  Check,
} from 'lucide-react';

// Mock data
const mockCurricula = [
  {
    id: '1',
    name: 'Kenya CBC',
    country: 'Kenya',
    status: 'active',
    subjects: 12,
    topics: 245,
    concepts: 1890,
    students: 4521,
    lastUpdated: '2024-02-15',
  },
  {
    id: '2',
    name: 'UK GCSE',
    country: 'United Kingdom',
    status: 'active',
    subjects: 15,
    topics: 312,
    concepts: 2450,
    students: 3245,
    lastUpdated: '2024-02-10',
  },
  {
    id: '3',
    name: 'US Common Core',
    country: 'United States',
    status: 'active',
    subjects: 10,
    topics: 198,
    concepts: 1560,
    students: 2890,
    lastUpdated: '2024-01-25',
  },
  {
    id: '4',
    name: 'IB Programme',
    country: 'International',
    status: 'active',
    subjects: 18,
    topics: 420,
    concepts: 3200,
    students: 1234,
    lastUpdated: '2024-02-20',
  },
  {
    id: '5',
    name: 'Nigeria WAEC',
    country: 'Nigeria',
    status: 'draft',
    subjects: 8,
    topics: 150,
    concepts: 980,
    students: 0,
    lastUpdated: '2024-03-01',
  },
];

const mockSubjects = [
  { id: '1', name: 'Mathematics', curriculum: 'Kenya CBC', topics: 32, concepts: 248, status: 'active' },
  { id: '2', name: 'English', curriculum: 'Kenya CBC', topics: 28, concepts: 195, status: 'active' },
  { id: '3', name: 'Science', curriculum: 'Kenya CBC', topics: 35, concepts: 310, status: 'active' },
  { id: '4', name: 'Social Studies', curriculum: 'Kenya CBC', topics: 22, concepts: 156, status: 'active' },
  { id: '5', name: 'Kiswahili', curriculum: 'Kenya CBC', topics: 24, concepts: 180, status: 'draft' },
];

type Tab = 'curricula' | 'subjects' | 'topics';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('curricula');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [expandedCurriculum, setExpandedCurriculum] = useState<string | null>(null);

  const filteredCurricula = mockCurricula.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = mockSubjects.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.curriculum.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalCurricula = mockCurricula.length;
  const activeCurricula = mockCurricula.filter(c => c.status === 'active').length;
  const totalSubjects = mockCurricula.reduce((sum, c) => sum + c.subjects, 0);
  const totalConcepts = mockCurricula.reduce((sum, c) => sum + c.concepts, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage curricula, subjects, and learning content</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCurricula}</p>
              <p className="text-sm text-gray-600">Curricula</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{activeCurricula}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalSubjects}</p>
              <p className="text-sm text-gray-600">Subjects</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Layers className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalConcepts.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Concepts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { id: 'curricula', label: 'Curricula', icon: Globe },
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'topics', label: 'Topics', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Curricula Tab */}
      {activeTab === 'curricula' && (
        <div className="space-y-4">
          {filteredCurricula.map((curriculum) => (
            <div
              key={curriculum.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedCurriculum(expandedCurriculum === curriculum.id ? null : curriculum.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{curriculum.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        curriculum.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {curriculum.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{curriculum.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center hidden md:block">
                    <p className="font-bold text-gray-900">{curriculum.subjects}</p>
                    <p className="text-xs text-gray-500">Subjects</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="font-bold text-gray-900">{curriculum.topics}</p>
                    <p className="text-xs text-gray-500">Topics</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="font-bold text-gray-900">{curriculum.concepts.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Concepts</p>
                  </div>
                  <div className="text-center hidden lg:block">
                    <p className="font-bold text-gray-900">{curriculum.students.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedCurriculum === curriculum.id ? 'rotate-180' : ''
                  }`} />
                </div>
              </div>

              {expandedCurriculum === curriculum.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">Last updated: {curriculum.lastUpdated}</p>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white">
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-white">
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Link
                      href={`/admin/content/curricula/${curriculum.id}/subjects`}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-red-200 hover:shadow-sm transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Manage Subjects</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                    <Link
                      href={`/admin/content/curricula/${curriculum.id}/topics`}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-red-200 hover:shadow-sm transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Manage Topics</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                    <Link
                      href={`/admin/content/curricula/${curriculum.id}/concepts`}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:border-red-200 hover:shadow-sm transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">Manage Concepts</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Curriculum</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Topics</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Concepts</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900">{subject.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{subject.curriculum}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{subject.topics}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{subject.concepts}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        subject.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {subject.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="View">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Topics Tab - placeholder */}
      {activeTab === 'topics' && (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Select a curriculum to view its topics</p>
          <button
            onClick={() => setActiveTab('curricula')}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Go to Curricula
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Content</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="curriculum">New Curriculum</option>
                  <option value="subject">New Subject</option>
                  <option value="topic">New Topic</option>
                  <option value="concept">New Concept</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
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
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
