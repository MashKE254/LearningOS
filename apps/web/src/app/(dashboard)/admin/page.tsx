'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Clock,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  School,
  GraduationCap,
  Activity,
} from 'lucide-react';

// Mock data
const mockStats = {
  totalUsers: 12547,
  userGrowth: 12.5,
  activeUsers: 8234,
  activeGrowth: 8.3,
  totalRevenue: 45680,
  revenueGrowth: 15.2,
  totalSessions: 156789,
  sessionGrowth: 22.1,
};

const mockUserBreakdown = {
  students: 10234,
  parents: 1856,
  teachers: 457,
};

const mockRecentActivity = [
  { id: '1', type: 'signup', user: 'Sarah Johnson', role: 'Student', time: '2 minutes ago' },
  { id: '2', type: 'subscription', user: 'Michael Chen', plan: 'Student Pro', amount: 9.99, time: '15 minutes ago' },
  { id: '3', type: 'signup', user: 'Emma Williams', role: 'Teacher', time: '32 minutes ago' },
  { id: '4', type: 'report', user: 'Anonymous', reason: 'Inappropriate content', time: '1 hour ago' },
  { id: '5', type: 'subscription', user: 'James Brown', plan: 'Family', amount: 19.99, time: '2 hours ago' },
];

const mockTopCurricula = [
  { name: 'Kenya CBC', students: 4521, growth: 15 },
  { name: 'UK GCSE', students: 3245, growth: 8 },
  { name: 'US Common Core', students: 2890, growth: 12 },
  { name: 'IB Programme', students: 1234, growth: 20 },
];

const mockSystemHealth = [
  { name: 'API Response', value: '45ms', status: 'good' },
  { name: 'Database', value: '99.9%', status: 'good' },
  { name: 'AI Service', value: '98.5%', status: 'good' },
  { name: 'Storage', value: '67%', status: 'warning' },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              mockStats.userGrowth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mockStats.userGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {mockStats.userGrowth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              mockStats.activeGrowth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mockStats.activeGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {mockStats.activeGrowth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockStats.activeUsers.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Active Users (7d)</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              mockStats.revenueGrowth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mockStats.revenueGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {mockStats.revenueGrowth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${mockStats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Revenue (MTD)</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              mockStats.sessionGrowth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mockStats.sessionGrowth > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {mockStats.sessionGrowth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockStats.totalSessions.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Learning Sessions (7d)</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">User Breakdown</h3>
            <Link href="/admin/users" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-900">Students</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{mockUserBreakdown.students.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">Parents</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{mockUserBreakdown.parents.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <School className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium text-gray-900">Teachers</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{mockUserBreakdown.teachers.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-red-600 hover:text-red-700">View all</button>
          </div>
          <div className="divide-y divide-gray-100">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'signup' ? 'bg-blue-100' :
                  activity.type === 'subscription' ? 'bg-green-100' :
                  'bg-red-100'
                }`}>
                  {activity.type === 'signup' && <Users className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'subscription' && <DollarSign className="w-4 h-4 text-green-600" />}
                  {activity.type === 'report' && <MessageSquare className="w-4 h-4 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.type === 'signup' && (
                      <><span className="font-medium">{activity.user}</span> signed up as {activity.role}</>
                    )}
                    {activity.type === 'subscription' && (
                      <><span className="font-medium">{activity.user}</span> subscribed to {activity.plan} (${activity.amount})</>
                    )}
                    {activity.type === 'report' && (
                      <>New report: {activity.reason}</>
                    )}
                  </p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Curricula */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Top Curricula</h3>
            <Link href="/admin/content" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              Manage <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {mockTopCurricula.map((curriculum, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{curriculum.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{curriculum.students.toLocaleString()} students</span>
                    <span className="text-xs text-green-600">+{curriculum.growth}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                    style={{ width: `${(curriculum.students / mockTopCurricula[0].students) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">System Health</h3>
            <Link href="/admin/settings" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
              Settings <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 space-y-4">
            {mockSystemHealth.map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{metric.value}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    metric.status === 'good' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Notice:</strong> Storage usage at 67%. Consider cleanup or upgrade.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Manage Users</span>
          </Link>
          <Link
            href="/admin/content"
            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center"
          >
            <BookOpen className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Edit Content</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">View Analytics</span>
          </Link>
          <Link
            href="/admin/moderation"
            className="p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-center"
          >
            <MessageSquare className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Review Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
