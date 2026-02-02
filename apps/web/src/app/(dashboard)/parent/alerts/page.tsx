'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Alert {
  id: string;
  childId: string;
  childName: string;
  type: 'struggle' | 'milestone' | 'inactive' | 'goal' | 'review';
  severity: 'info' | 'warning' | 'success' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'struggle' | 'milestone'>('all');

  useEffect(() => {
    // Mock data
    setAlerts([
      {
        id: '1',
        childId: '1',
        childName: 'Alex',
        type: 'struggle',
        severity: 'warning',
        title: 'Struggling with Quadratic Equations',
        message: 'Alex has attempted quadratic factorization problems 5 times in the last 2 sessions with less than 50% accuracy. Consider reviewing foundational concepts.',
        timestamp: '2 hours ago',
        read: false,
        actionUrl: '/parent/children/1',
        actionLabel: 'View Progress',
      },
      {
        id: '2',
        childId: '1',
        childName: 'Alex',
        type: 'milestone',
        severity: 'success',
        title: 'Achievement Unlocked!',
        message: 'Alex achieved 85% mastery in Photosynthesis! This is a significant improvement from last week.',
        timestamp: '1 day ago',
        read: false,
      },
      {
        id: '3',
        childId: '2',
        childName: 'Jamie',
        type: 'inactive',
        severity: 'info',
        title: 'Inactive for 2 Days',
        message: "Jamie hasn't logged any study sessions in the past 48 hours. A gentle reminder might help maintain their streak.",
        timestamp: '1 day ago',
        read: true,
      },
      {
        id: '4',
        childId: '1',
        childName: 'Alex',
        type: 'goal',
        severity: 'success',
        title: 'Weekly Goal Reached!',
        message: 'Alex has completed their weekly study goal of 4 hours. Great consistency!',
        timestamp: '2 days ago',
        read: true,
      },
      {
        id: '5',
        childId: '2',
        childName: 'Jamie',
        type: 'struggle',
        severity: 'warning',
        title: 'Fraction Difficulties',
        message: 'Jamie is having trouble with fraction-to-decimal conversions. The AI tutor has adapted to provide more visual explanations.',
        timestamp: '3 days ago',
        read: true,
      },
      {
        id: '6',
        childId: '1',
        childName: 'Alex',
        type: 'review',
        severity: 'info',
        title: 'Spaced Review Due',
        message: "Linear Equations hasn't been reviewed in 7 days. A quick review session can help maintain mastery.",
        timestamp: '3 days ago',
        read: true,
      },
      {
        id: '7',
        childId: '2',
        childName: 'Jamie',
        type: 'milestone',
        severity: 'success',
        title: '5-Day Streak!',
        message: "Jamie has maintained a 5-day study streak. That's their longest streak yet!",
        timestamp: '4 days ago',
        read: true,
      },
    ]);
    setLoading(false);
  }, []);

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.read;
    if (filter === 'struggle') return alert.type === 'struggle';
    if (filter === 'milestone') return alert.type === 'milestone';
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  const getAlertIcon = (type: Alert['type'], severity: Alert['severity']) => {
    const bgColor = {
      success: 'bg-green-500/20',
      warning: 'bg-yellow-500/20',
      urgent: 'bg-red-500/20',
      info: 'bg-blue-500/20',
    }[severity];

    const iconColor = {
      success: 'text-green-400',
      warning: 'text-yellow-400',
      urgent: 'text-red-400',
      info: 'text-blue-400',
    }[severity];

    const icons: Record<Alert['type'], JSX.Element> = {
      struggle: (
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      milestone: (
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      inactive: (
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      goal: (
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      review: (
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    };

    return (
      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
        {icons[type]}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <p className="text-slate-400 text-sm mt-1">
            Stay informed about your children's learning progress
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All', count: alerts.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'struggle', label: 'Needs Attention', count: alerts.filter(a => a.type === 'struggle').length },
          { key: 'milestone', label: 'Achievements', count: alerts.filter(a => a.type === 'milestone').length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === key
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {label}
            <span className={`ml-2 ${filter === key ? 'text-purple-200' : 'text-slate-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No alerts</h3>
            <p className="text-slate-400">
              {filter === 'unread' ? 'All caught up! No unread alerts.' : 'No alerts match this filter.'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-slate-900/50 border rounded-xl p-4 transition-all ${
                !alert.read 
                  ? 'border-purple-500/30 bg-purple-500/5' 
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start space-x-4">
                {getAlertIcon(alert.type, alert.severity)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${!alert.read ? 'text-white' : 'text-slate-300'}`}>
                          {alert.title}
                        </h3>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-3 text-xs">
                        <Link
                          href={`/parent/children/${alert.childId}`}
                          className="text-purple-400 hover:text-purple-300"
                        >
                          {alert.childName}
                        </Link>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">{alert.timestamp}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {alert.actionUrl && (
                        <Link
                          href={alert.actionUrl}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          {alert.actionLabel || 'View'}
                        </Link>
                      )}
                      <div className="relative group">
                        <button className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {/* Dropdown menu */}
                        <div className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          {!alert.read && (
                            <button
                              onClick={() => markAsRead(alert.id)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 transition-colors rounded-t-lg"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 transition-colors rounded-b-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Settings CTA */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Alert Preferences</h3>
              <p className="text-sm text-slate-400">Customize which alerts you receive and how</p>
            </div>
          </div>
          <Link
            href="/parent/settings"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
          >
            Configure Alerts
          </Link>
        </div>
      </div>
    </div>
  );
}
