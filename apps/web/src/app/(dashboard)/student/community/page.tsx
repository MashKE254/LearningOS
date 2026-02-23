'use client';

import { useState, useEffect } from 'react';

/**
 * Community Learning Needs Board + Collaborative Authoring
 *
 * Students declare struggles, upvote others.
 * AI aggregates into class-wide gap analysis.
 * Also browse and contribute community-authored explanations.
 */

interface LearningNeed {
  id: string;
  topic: string;
  description?: string;
  votes: number;
  voters: string[];
  status: 'open' | 'addressed' | 'closed';
  createdAt: string;
  response?: string;
}

interface CommunityContent {
  id: string;
  type: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  subject: string;
  topic: string;
  upvotes: number;
  downvotes: number;
  relevanceScore: number;
  aiVerified: boolean;
  usedInResponses: number;
  tags: string[];
}

type ActiveTab = 'needs' | 'content' | 'create';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('needs');
  const [needs, setNeeds] = useState<LearningNeed[]>([]);
  const [content, setContent] = useState<CommunityContent[]>([]);
  const [newNeedTopic, setNewNeedTopic] = useState('');
  const [newNeedDesc, setNewNeedDesc] = useState('');

  // Create content form state
  const [newContentType, setNewContentType] = useState('explanation');
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentBody, setNewContentBody] = useState('');
  const [newContentSubject, setNewContentSubject] = useState('');
  const [newContentTopic, setNewContentTopic] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch learning needs
      const needsRes = await fetch('/api/learning-needs?classroomId=demo_class_1');
      if (needsRes.ok) {
        const data = await needsRes.json();
        setNeeds(Array.isArray(data) ? data : []);
      }

      // Fetch community content
      const contentRes = await fetch('/api/collaborative-authoring?sortBy=relevance&limit=20');
      if (contentRes.ok) {
        const data = await contentRes.json();
        setContent(data.content || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function submitNeed() {
    if (!newNeedTopic.trim()) return;
    try {
      const res = await fetch('/api/learning-needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId: 'demo_class_1',
          topic: newNeedTopic,
          description: newNeedDesc,
          createdBy: 'student_1',
        }),
      });
      if (res.ok) {
        setNewNeedTopic('');
        setNewNeedDesc('');
        fetchData();
      }
    } catch (err) {
      console.error('Error submitting need:', err);
    }
  }

  async function voteNeed(needId: string) {
    try {
      await fetch('/api/learning-needs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: needId, action: 'vote', userId: 'student_1' }),
      });
      fetchData();
    } catch (err) {
      console.error('Error voting:', err);
    }
  }

  async function voteContent(contentId: string, vote: 'up' | 'down') {
    try {
      await fetch('/api/collaborative-authoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vote', contentId, userId: 'student_1', vote }),
      });
      fetchData();
    } catch (err) {
      console.error('Error voting:', err);
    }
  }

  async function submitContent() {
    if (!newContentTitle.trim() || !newContentBody.trim() || !newContentSubject.trim() || !newContentTopic.trim()) return;
    try {
      const res = await fetch('/api/collaborative-authoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newContentType,
          title: newContentTitle,
          content: newContentBody,
          subject: newContentSubject,
          topic: newContentTopic,
          authorId: 'student_1',
          authorName: 'You',
          authorRole: 'student',
        }),
      });
      if (res.ok) {
        setNewContentTitle('');
        setNewContentBody('');
        setNewContentSubject('');
        setNewContentTopic('');
        setActiveTab('content');
        fetchData();
      }
    } catch (err) {
      console.error('Error submitting content:', err);
    }
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      explanation: 'bg-blue-500/20 text-blue-400',
      practice_problem: 'bg-green-500/20 text-green-400',
      mnemonic: 'bg-purple-500/20 text-purple-400',
      analogy: 'bg-amber-500/20 text-amber-400',
      worked_example: 'bg-cyan-500/20 text-cyan-400',
      study_guide: 'bg-pink-500/20 text-pink-400',
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Community Hub</h1>
        <p className="text-slate-400">Share knowledge, ask for help, and learn from peers.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl">
        {[
          { id: 'needs' as const, label: 'Learning Needs', icon: '?' },
          { id: 'content' as const, label: 'Community Content', icon: '★' },
          { id: 'create' as const, label: 'Contribute', icon: '+' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Learning Needs Board */}
      {activeTab === 'needs' && (
        <div className="space-y-4">
          {/* Submit new need */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-white font-medium">What are you struggling with?</p>
            <input
              type="text"
              value={newNeedTopic}
              onChange={e => setNewNeedTopic(e.target.value)}
              placeholder="e.g., Quadratic equations, Photosynthesis..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              value={newNeedDesc}
              onChange={e => setNewNeedDesc(e.target.value)}
              placeholder="Optional: What specifically is confusing?"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              rows={2}
            />
            <button
              onClick={submitNeed}
              disabled={!newNeedTopic.trim()}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg transition-colors text-sm"
            >
              Share with Class
            </button>
          </div>

          {/* Needs list */}
          <div className="space-y-2">
            {needs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400">No learning needs posted yet. Be the first!</p>
              </div>
            )}
            {needs.map(need => (
              <div key={need.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-start gap-4">
                <button
                  onClick={() => voteNeed(need.id)}
                  className="flex flex-col items-center gap-1 min-w-[48px] pt-1"
                >
                  <svg className="w-5 h-5 text-indigo-400 hover:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-lg font-bold text-white">{need.votes}</span>
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{need.topic}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      need.status === 'open' ? 'bg-amber-500/20 text-amber-400' :
                      need.status === 'addressed' ? 'bg-green-500/20 text-green-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {need.status}
                    </span>
                  </div>
                  {need.description && <p className="text-sm text-slate-400">{need.description}</p>}
                  {need.response && (
                    <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-green-400 font-medium mb-1">Teacher Response:</p>
                      <p className="text-sm text-green-200">{need.response}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Content */}
      {activeTab === 'content' && (
        <div className="space-y-3">
          {content.map(item => (
            <div key={item.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start gap-4">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-1 min-w-[48px]">
                  <button onClick={() => voteContent(item.id, 'up')} className="text-green-400 hover:text-green-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="text-lg font-bold text-white">{item.upvotes - item.downvotes}</span>
                  <button onClick={() => voteContent(item.id, 'down')} className="text-red-400 hover:text-red-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(item.type)}`}>
                      {item.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">{item.subject}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">{item.topic}</span>
                    {item.aiVerified && (
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{item.content.length > 300 ? item.content.slice(0, 300) + '...' : item.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>By {item.authorName} ({item.authorRole})</span>
                    <span>Used in {item.usedInResponses} AI responses</span>
                    <span>Score: {(item.relevanceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Content */}
      {activeTab === 'create' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Contribute to the Community</h2>
            <p className="text-sm text-slate-400">Share your understanding to help others learn. Top-rated content gets used by the AI tutor!</p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Type</label>
            <select
              value={newContentType}
              onChange={e => setNewContentType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="explanation">Explanation</option>
              <option value="analogy">Analogy</option>
              <option value="mnemonic">Mnemonic / Memory Aid</option>
              <option value="worked_example">Worked Example</option>
              <option value="practice_problem">Practice Problem</option>
              <option value="study_guide">Study Guide</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Subject</label>
              <input
                type="text"
                value={newContentSubject}
                onChange={e => setNewContentSubject(e.target.value)}
                placeholder="e.g., Mathematics"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Topic</label>
              <input
                type="text"
                value={newContentTopic}
                onChange={e => setNewContentTopic(e.target.value)}
                placeholder="e.g., Quadratic Equations"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={newContentTitle}
              onChange={e => setNewContentTitle(e.target.value)}
              placeholder="Give your content a clear, descriptive title"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Content</label>
            <textarea
              value={newContentBody}
              onChange={e => setNewContentBody(e.target.value)}
              placeholder="Write your explanation, example, or problem here..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              rows={8}
            />
          </div>

          <button
            onClick={submitContent}
            disabled={!newContentTitle.trim() || !newContentBody.trim() || !newContentSubject.trim() || !newContentTopic.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Publish
          </button>
        </div>
      )}
    </div>
  );
}
