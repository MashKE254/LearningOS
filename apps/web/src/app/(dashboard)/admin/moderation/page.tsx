'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Flag,
  MessageSquare,
  User,
  Clock,
  Check,
  X,
  Eye,
  Ban,
  MoreVertical,
  Filter,
  ChevronDown,
  Shield,
} from 'lucide-react';

// Mock data
const mockReports = [
  {
    id: '1',
    type: 'content',
    reason: 'Inappropriate language',
    status: 'pending',
    reportedBy: 'Sarah Johnson',
    reportedAt: '2024-02-28 14:30',
    content: 'Message in AI chat session',
    contentPreview: 'User sent a message containing...',
    targetUser: 'James Brown',
    targetUserId: '5',
    priority: 'high',
  },
  {
    id: '2',
    type: 'user',
    reason: 'Suspected bot/spam account',
    status: 'pending',
    reportedBy: 'System',
    reportedAt: '2024-02-28 12:15',
    content: 'User profile',
    contentPreview: 'Multiple rapid signups from same IP',
    targetUser: 'test123456',
    targetUserId: '10',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'content',
    reason: 'Academic dishonesty',
    status: 'reviewing',
    reportedBy: 'Emma Williams',
    reportedAt: '2024-02-27 16:45',
    content: 'Assignment submission',
    contentPreview: 'Suspected copy-paste from external source',
    targetUser: 'Michael Chen',
    targetUserId: '2',
    priority: 'high',
  },
  {
    id: '4',
    type: 'content',
    reason: 'Harmful content',
    status: 'resolved',
    reportedBy: 'Anonymous',
    reportedAt: '2024-02-26 09:20',
    content: 'AI chat session',
    contentPreview: 'Conversation about dangerous topics',
    targetUser: 'Alex Kim',
    targetUserId: '1',
    priority: 'critical',
    resolution: 'Content removed, user warned',
  },
  {
    id: '5',
    type: 'user',
    reason: 'Harassment',
    status: 'dismissed',
    reportedBy: 'Tom Wilson',
    reportedAt: '2024-02-25 11:00',
    content: 'Class chat message',
    contentPreview: 'User felt targeted by another student',
    targetUser: 'Lisa Park',
    targetUserId: '6',
    priority: 'low',
    resolution: 'No violation found',
  },
];

const mockModerationActions = [
  { id: '1', action: 'Content removed', user: 'James Brown', moderator: 'Admin', date: '2024-02-28' },
  { id: '2', action: 'Warning issued', user: 'Alex Kim', moderator: 'Admin', date: '2024-02-26' },
  { id: '3', action: 'Account suspended', user: 'spam_user', moderator: 'System', date: '2024-02-25' },
  { id: '4', action: 'Report dismissed', user: 'Lisa Park', moderator: 'Admin', date: '2024-02-25' },
];

type Status = 'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed';
type Priority = 'all' | 'critical' | 'high' | 'medium' | 'low';

export default function AdminModerationPage() {
  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority>('all');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredReports = mockReports.filter((report) => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'reviewing': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'dismissed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const pendingCount = mockReports.filter(r => r.status === 'pending').length;
  const reviewingCount = mockReports.filter(r => r.status === 'reviewing').length;
  const resolvedCount = mockReports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600">Review reports and manage platform content</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{reviewingCount}</p>
              <p className="text-sm text-gray-600">In Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {mockReports.filter(r => r.priority === 'critical' && r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
              report.priority === 'critical' ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    report.type === 'content' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {report.type === 'content' ? (
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900">{report.reason}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {report.content} • Reported by {report.reportedBy}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="text-gray-500">Target:</span>{' '}
                      <span className="font-medium">{report.targetUser}</span>
                    </p>
                    {report.resolution && (
                      <p className="text-sm text-green-600 mt-2">
                        Resolution: {report.resolution}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{report.reportedAt}</span>
                  {(report.status === 'pending' || report.status === 'reviewing') && (
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-green-100 rounded text-green-600" title="Resolve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Dismiss">
                        <X className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === report.id ? null : report.id)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {activeMenu === report.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              View Full Content
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              View User Profile
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-amber-600">
                              <AlertTriangle className="w-4 h-4" />
                              Warn User
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600">
                              <Ban className="w-4 h-4" />
                              Suspend User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reports matching your filters</p>
          </div>
        )}
      </div>

      {/* Recent Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Moderation Actions</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {mockModerationActions.map((action) => (
            <div key={action.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Shield className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{action.action}</span> for{' '}
                    <span className="font-medium">{action.user}</span>
                  </p>
                  <p className="text-xs text-gray-500">By {action.moderator}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{action.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">Moderation Guidelines</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Review all critical priority reports within 1 hour</li>
          <li>• Document all actions taken with clear reasoning</li>
          <li>• Escalate ambiguous cases to senior moderators</li>
          <li>• Issue warnings before suspensions for first-time offenses</li>
          <li>• Preserve evidence before removing content</li>
        </ul>
      </div>
    </div>
  );
}
