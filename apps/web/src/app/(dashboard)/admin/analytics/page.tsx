'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  BarChart3,
  Calendar,
  Download,
  Filter,
  MessageSquare,
  Target,
} from 'lucide-react';

// Mock data
const mockMetrics = {
  users: {
    total: 12547,
    growth: 12.5,
    daily: [450, 520, 480, 590, 610, 550, 620],
  },
  sessions: {
    total: 156789,
    growth: 22.1,
    avgDuration: 18,
    daily: [5200, 5800, 5400, 6100, 6300, 5900, 6500],
  },
  revenue: {
    total: 45680,
    growth: 15.2,
    mrr: 38500,
    daily: [1200, 1450, 1380, 1520, 1680, 1490, 1760],
  },
  engagement: {
    dau: 3245,
    mau: 8234,
    retention: 68,
    avgMastery: 72,
  },
};

const mockTopCountries = [
  { name: 'Kenya', users: 4521, percentage: 36 },
  { name: 'United Kingdom', users: 3245, percentage: 26 },
  { name: 'United States', users: 2890, percentage: 23 },
  { name: 'Nigeria', users: 1234, percentage: 10 },
  { name: 'Other', users: 657, percentage: 5 },
];

const mockTopSubjects = [
  { name: 'Mathematics', sessions: 45230, avgScore: 75 },
  { name: 'Science', sessions: 38450, avgScore: 72 },
  { name: 'English', sessions: 32100, avgScore: 78 },
  { name: 'Physics', sessions: 21560, avgScore: 68 },
  { name: 'Chemistry', sessions: 19449, avgScore: 70 },
];

const mockConversionFunnel = [
  { stage: 'Visitors', count: 50000, percentage: 100 },
  { stage: 'Signups', count: 12547, percentage: 25 },
  { stage: 'Active Users', count: 8234, percentage: 16 },
  { stage: 'Paid Users', count: 2156, percentage: 4 },
];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metric, setMetric] = useState('users');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getChartData = () => {
    switch (metric) {
      case 'users':
        return mockMetrics.users.daily;
      case 'sessions':
        return mockMetrics.sessions.daily;
      case 'revenue':
        return mockMetrics.revenue.daily;
      default:
        return mockMetrics.users.daily;
    }
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Platform metrics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setMetric('users')}
          className={`bg-white rounded-xl p-4 shadow-sm border transition-colors text-left ${
            metric === 'users' ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              mockMetrics.users.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mockMetrics.users.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {mockMetrics.users.growth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockMetrics.users.total.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Users</p>
        </button>

        <button
          onClick={() => setMetric('sessions')}
          className={`bg-white rounded-xl p-4 shadow-sm border transition-colors text-left ${
            metric === 'sessions' ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              mockMetrics.sessions.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mockMetrics.sessions.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {mockMetrics.sessions.growth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockMetrics.sessions.total.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Learning Sessions</p>
        </button>

        <button
          onClick={() => setMetric('revenue')}
          className={`bg-white rounded-xl p-4 shadow-sm border transition-colors text-left ${
            metric === 'revenue' ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              mockMetrics.revenue.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {mockMetrics.revenue.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {mockMetrics.revenue.growth}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${mockMetrics.revenue.total.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Revenue (MTD)</p>
        </button>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{mockMetrics.engagement.avgMastery}%</p>
          <p className="text-sm text-gray-600">Avg Mastery</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">
            {metric === 'users' && 'User Growth'}
            {metric === 'sessions' && 'Learning Sessions'}
            {metric === 'revenue' && 'Revenue'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">This Period</span>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.map((value, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '200px' }}>
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-red-500 to-orange-400 rounded-t transition-all hover:from-red-600 hover:to-orange-500"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{days[idx]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Engagement Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Engagement</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Daily Active Users</span>
              <span className="font-bold text-gray-900">{mockMetrics.engagement.dau.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Monthly Active Users</span>
              <span className="font-bold text-gray-900">{mockMetrics.engagement.mau.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">DAU/MAU Ratio</span>
              <span className="font-bold text-gray-900">
                {((mockMetrics.engagement.dau / mockMetrics.engagement.mau) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">7-Day Retention</span>
              <span className="font-bold text-green-600">{mockMetrics.engagement.retention}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Avg Session Duration</span>
              <span className="font-bold text-gray-900">{mockMetrics.sessions.avgDuration} min</span>
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top Countries</h3>
          </div>
          <div className="p-4 space-y-3">
            {mockTopCountries.map((country, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{country.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {country.users.toLocaleString()} ({country.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full"
                    style={{ width: `${country.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Subjects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top Subjects</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockTopSubjects.map((subject, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{subject.name}</p>
                  <p className="text-xs text-gray-500">{subject.sessions.toLocaleString()} sessions</p>
                </div>
                <span className={`text-sm font-medium ${
                  subject.avgScore >= 75 ? 'text-green-600' :
                  subject.avgScore >= 60 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {subject.avgScore}% avg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
        <div className="flex items-center justify-between gap-4">
          {mockConversionFunnel.map((stage, idx) => (
            <div key={idx} className="flex-1 text-center">
              <div
                className="mx-auto mb-3 bg-gradient-to-b from-red-100 to-red-50 rounded-lg flex items-center justify-center"
                style={{
                  width: `${100 - idx * 15}%`,
                  height: `${120 - idx * 20}px`,
                }}
              >
                <span className="text-lg font-bold text-red-600">{stage.count.toLocaleString()}</span>
              </div>
              <p className="text-sm font-medium text-gray-900">{stage.stage}</p>
              <p className="text-xs text-gray-500">{stage.percentage}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <Clock className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">2.4M</p>
          <p className="text-sm opacity-80">Total Learning Minutes</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <MessageSquare className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">8.2M</p>
          <p className="text-sm opacity-80">AI Tutor Messages</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <Target className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">45K</p>
          <p className="text-sm opacity-80">Concepts Mastered</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <BarChart3 className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">$38.5K</p>
          <p className="text-sm opacity-80">MRR</p>
        </div>
      </div>
    </div>
  );
}
