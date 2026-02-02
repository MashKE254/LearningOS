'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Child {
  id: string;
  name: string;
  email: string;
  grade: string;
  curriculum: string;
  stats: {
    streak: number;
    timeThisWeek: number;
    conceptsMastered: number;
    avgMastery: number;
    lastActive: string;
    totalSessions: number;
  };
  subscription: {
    plan: string;
    status: string;
  };
}

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    // Mock data for demo
    setChildren([
      {
        id: '1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        grade: 'Grade 8',
        curriculum: 'Kenya CBC',
        stats: {
          streak: 12,
          timeThisWeek: 245,
          conceptsMastered: 34,
          avgMastery: 78,
          lastActive: '2 hours ago',
          totalSessions: 156,
        },
        subscription: {
          plan: 'Student Pro',
          status: 'active',
        },
      },
      {
        id: '2',
        name: 'Jamie Johnson',
        email: 'jamie@example.com',
        grade: 'Grade 6',
        curriculum: 'Kenya CBC',
        stats: {
          streak: 5,
          timeThisWeek: 180,
          conceptsMastered: 22,
          avgMastery: 65,
          lastActive: '1 day ago',
          totalSessions: 89,
        },
        subscription: {
          plan: 'Free',
          status: 'active',
        },
      },
    ]);
    setLoading(false);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInviteModal(false);
    setInviting(false);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-400';
    if (mastery >= 60) return 'text-yellow-400';
    return 'text-red-400';
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
          <h1 className="text-2xl font-bold text-white">Your Children</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and monitor your children's learning</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Child</span>
        </button>
      </div>

      {/* Children List */}
      <div className="space-y-4">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Child Info */}
              <div className="flex items-center space-x-4 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {child.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{child.name}</h3>
                  <p className="text-sm text-slate-400">{child.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-500">{child.grade}</span>
                    <span className="text-slate-700">•</span>
                    <span className="text-xs text-slate-500">{child.curriculum}</span>
                    <span className="text-slate-700">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      child.subscription.plan === 'Free' 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {child.subscription.plan}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-orange-400">{child.stats.streak}</p>
                  <p className="text-xs text-slate-500">Day Streak</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-blue-400">{formatTime(child.stats.timeThisWeek)}</p>
                  <p className="text-xs text-slate-500">This Week</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-400">{child.stats.conceptsMastered}</p>
                  <p className="text-xs text-slate-500">Mastered</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className={`text-xl font-bold ${getMasteryColor(child.stats.avgMastery)}`}>
                    {child.stats.avgMastery}%
                  </p>
                  <p className="text-xs text-slate-500">Avg Mastery</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <Link
                  href={`/parent/children/${child.id}`}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors text-center"
                >
                  View Details
                </Link>
                <Link
                  href={`/parent/reports?child=${child.id}`}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors text-center"
                >
                  Reports
                </Link>
              </div>
            </div>

            {/* Last Activity */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Last active: <span className="text-slate-400">{child.stats.lastActive}</span>
              </span>
              <span className="text-slate-500">
                Total sessions: <span className="text-slate-400">{child.stats.totalSessions}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {children.length === 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No children linked yet</h3>
          <p className="text-slate-400 mb-6">Add your children to monitor their learning progress</p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors"
          >
            Add Your First Child
          </button>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-white mb-2">Add a Child</h2>
            <p className="text-slate-400 text-sm mb-6">
              Enter your child's email to send them an invitation to connect their account.
            </p>

            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Child's Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="child@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-white mb-2">What happens next?</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Your child will receive an invitation email</li>
                  <li>• They can accept or decline the connection</li>
                  <li>• Once connected, you can view their progress</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
