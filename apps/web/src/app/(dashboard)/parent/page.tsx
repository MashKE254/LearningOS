'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Child {
  id: string;
  name: string;
  email: string;
  grade: string;
  avatar?: string;
  stats: {
    streak: number;
    timeThisWeek: number;
    conceptsMastered: number;
    avgMastery: number;
    lastActive: string;
  };
  recentTopics: string[];
  alerts: number;
}

interface Alert {
  id: string;
  childId: string;
  childName: string;
  type: 'struggle' | 'milestone' | 'inactive' | 'goal';
  message: string;
  timestamp: string;
  read: boolean;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch children data
        const childrenRes = await fetch('/api/parent/children', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Fetch alerts
        const alertsRes = await fetch('/api/parent/alerts?limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (childrenRes.ok) {
          const data = await childrenRes.json();
          setChildren(data.children || []);
        }

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAlerts(data.alerts || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Mock data for demo
    setChildren([
      {
        id: '1',
        name: 'Alex',
        email: 'alex@example.com',
        grade: 'Grade 8',
        stats: {
          streak: 12,
          timeThisWeek: 245,
          conceptsMastered: 34,
          avgMastery: 78,
          lastActive: '2 hours ago',
        },
        recentTopics: ['Quadratic Equations', 'Photosynthesis', 'Essay Writing'],
        alerts: 2,
      },
      {
        id: '2',
        name: 'Jamie',
        email: 'jamie@example.com',
        grade: 'Grade 6',
        stats: {
          streak: 5,
          timeThisWeek: 180,
          conceptsMastered: 22,
          avgMastery: 65,
          lastActive: '1 day ago',
        },
        recentTopics: ['Fractions', 'Simple Machines', 'Sentence Structure'],
        alerts: 1,
      },
    ]);

    setAlerts([
      {
        id: '1',
        childId: '1',
        childName: 'Alex',
        type: 'struggle',
        message: 'Alex has been struggling with Quadratic Equations for the past 3 sessions',
        timestamp: '2 hours ago',
        read: false,
      },
      {
        id: '2',
        childId: '1',
        childName: 'Alex',
        type: 'milestone',
        message: 'Alex achieved 80% mastery in Photosynthesis!',
        timestamp: '1 day ago',
        read: false,
      },
      {
        id: '3',
        childId: '2',
        childName: 'Jamie',
        type: 'inactive',
        message: 'Jamie hasn\'t studied for 2 days',
        timestamp: '1 day ago',
        read: true,
      },
    ]);
    setLoading(false);
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'struggle':
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'milestone':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'inactive':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
        <p className="text-slate-400">Here's how your children are doing this week.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Total Study Time</p>
          <p className="text-2xl font-bold text-white">
            {formatTime(children.reduce((acc, c) => acc + c.stats.timeThisWeek, 0))}
          </p>
          <p className="text-xs text-green-400 mt-1">This week</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Avg Mastery</p>
          <p className="text-2xl font-bold text-white">
            {Math.round(children.reduce((acc, c) => acc + c.stats.avgMastery, 0) / (children.length || 1))}%
          </p>
          <p className="text-xs text-purple-400 mt-1">All children</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Concepts Mastered</p>
          <p className="text-2xl font-bold text-white">
            {children.reduce((acc, c) => acc + c.stats.conceptsMastered, 0)}
          </p>
          <p className="text-xs text-blue-400 mt-1">Total</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">Unread Alerts</p>
          <p className="text-2xl font-bold text-white">
            {alerts.filter(a => !a.read).length}
          </p>
          <p className="text-xs text-yellow-400 mt-1">Need attention</p>
        </div>
      </div>

      {/* Children Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Your Children</h2>
          <Link
            href="/parent/children"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {children.map((child) => (
            <Link
              key={child.id}
              href={`/parent/children/${child.id}`}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {child.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {child.name}
                    </h3>
                    <p className="text-sm text-slate-400">{child.grade}</p>
                    <p className="text-xs text-slate-500">Active {child.stats.lastActive}</p>
                  </div>
                </div>
                {child.alerts > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                    {child.alerts} alert{child.alerts > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-400">{child.stats.streak}</p>
                  <p className="text-xs text-slate-500">Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-400">{formatTime(child.stats.timeThisWeek)}</p>
                  <p className="text-xs text-slate-500">Time</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-400">{child.stats.conceptsMastered}</p>
                  <p className="text-xs text-slate-500">Mastered</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-400">{child.stats.avgMastery}%</p>
                  <p className="text-xs text-slate-500">Avg</p>
                </div>
              </div>

              {/* Recent Topics */}
              <div>
                <p className="text-xs text-slate-500 mb-2">Recent topics</p>
                <div className="flex flex-wrap gap-2">
                  {child.recentTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}

          {/* Add Child Card */}
          <Link
            href="/parent/children/add"
            className="bg-slate-900/30 border border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center min-h-[250px] hover:border-purple-500/50 hover:bg-slate-900/50 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
              <svg className="w-6 h-6 text-slate-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-slate-400 group-hover:text-purple-400 transition-colors">Add a child</p>
            <p className="text-xs text-slate-500 mt-1">Connect their account</p>
          </Link>
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Alerts</h2>
          <Link
            href="/parent/alerts"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {alerts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No alerts yet. Check back later!</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 flex items-start space-x-4 ${!alert.read ? 'bg-purple-500/5' : ''}`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!alert.read ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{alert.timestamp}</p>
                </div>
                {!alert.read && (
                  <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2"></span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Weekly Summary CTA */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Weekly Progress Report</h3>
            <p className="text-slate-300 text-sm">
              Get a detailed breakdown of your children's learning progress every week.
            </p>
          </div>
          <Link
            href="/parent/reports"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
