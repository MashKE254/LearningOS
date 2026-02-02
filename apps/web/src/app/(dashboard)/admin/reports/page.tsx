'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  BookOpen,
  Plus,
  MoreVertical,
  Play,
  Eye,
  Trash2,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';

// Mock data
const mockReports = [
  {
    id: '1',
    name: 'Monthly Revenue Report',
    type: 'revenue',
    schedule: 'Monthly',
    lastRun: '2024-02-01',
    status: 'completed',
    format: 'PDF',
  },
  {
    id: '2',
    name: 'User Growth Analysis',
    type: 'users',
    schedule: 'Weekly',
    lastRun: '2024-02-25',
    status: 'completed',
    format: 'Excel',
  },
  {
    id: '3',
    name: 'Learning Progress Summary',
    type: 'learning',
    schedule: 'Daily',
    lastRun: '2024-02-28',
    status: 'running',
    format: 'PDF',
  },
  {
    id: '4',
    name: 'Subscription Churn Analysis',
    type: 'revenue',
    schedule: 'Monthly',
    lastRun: '2024-02-01',
    status: 'completed',
    format: 'Excel',
  },
  {
    id: '5',
    name: 'Content Engagement Report',
    type: 'learning',
    schedule: 'Weekly',
    lastRun: '2024-02-20',
    status: 'failed',
    format: 'PDF',
  },
];

const mockScheduledReports = [
  { id: '1', name: 'Daily Active Users', nextRun: '2024-03-01 00:00', recipients: 2 },
  { id: '2', name: 'Weekly Revenue Summary', nextRun: '2024-03-04 08:00', recipients: 3 },
  { id: '3', name: 'Monthly KPI Dashboard', nextRun: '2024-03-01 09:00', recipients: 5 },
];

const reportTemplates = [
  { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'MRR, ARR, churn, and revenue trends' },
  { id: 'users', name: 'User Report', icon: Users, description: 'Signups, active users, and demographics' },
  { id: 'learning', name: 'Learning Report', icon: BookOpen, description: 'Sessions, mastery, and progress' },
  { id: 'performance', name: 'Performance Report', icon: TrendingUp, description: 'System metrics and uptime' },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'generated' | 'scheduled' | 'templates'>('generated');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'running': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <DollarSign className="w-4 h-4" />;
      case 'users': return <Users className="w-4 h-4" />;
      case 'learning': return <BookOpen className="w-4 h-4" />;
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and manage platform reports</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Report
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockReports.length}</p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {mockReports.filter(r => r.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockScheduledReports.length}</p>
              <p className="text-sm text-gray-600">Scheduled</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {mockReports.filter(r => r.status === 'failed').length}
              </p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {[
            { id: 'generated', label: 'Generated Reports' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'templates', label: 'Templates' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Reports */}
      {activeTab === 'generated' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Report</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Schedule</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Last Run</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Format</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getTypeIcon(report.type)}
                        </div>
                        <span className="font-medium text-gray-900">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 capitalize">{report.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{report.schedule}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{report.lastRun}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{report.format}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {report.status === 'completed' && (
                          <>
                            <button className="p-1 hover:bg-gray-100 rounded" title="View">
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded" title="Download">
                              <Download className="w-4 h-4 text-gray-400" />
                            </button>
                          </>
                        )}
                        {report.status === 'failed' && (
                          <button className="p-1 hover:bg-gray-100 rounded" title="Retry">
                            <RefreshCw className="w-4 h-4 text-gray-400" />
                          </button>
                        )}
                        {report.status === 'running' && (
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        )}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenu(activeMenu === report.id ? null : report.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {activeMenu === report.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Run Now
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Edit Schedule
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scheduled Reports */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          {mockScheduledReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500">Next run: {report.nextRun}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{report.recipients} recipients</span>
                <button className="text-sm text-red-600 hover:text-red-700">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-2 gap-4">
          {reportTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <template.icon className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  <button className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium">
                    Generate Report →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Report</h2>
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
                  Report Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Weekly User Report"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="revenue">Revenue Report</option>
                  <option value="users">User Report</option>
                  <option value="learning">Learning Report</option>
                  <option value="performance">Performance Report</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" value="pdf" defaultChecked className="text-red-500" />
                    <span className="text-sm">PDF</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" value="excel" className="text-red-500" />
                    <span className="text-sm">Excel</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="format" value="csv" className="text-red-500" />
                    <span className="text-sm">CSV</span>
                  </label>
                </div>
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
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
