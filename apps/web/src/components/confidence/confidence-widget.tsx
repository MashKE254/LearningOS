'use client';

import { useState } from 'react';

/**
 * Bidirectional Confidence Tracking Widget
 *
 * Shows the student (and teacher) where confidence diverges
 * from actual performance. Unique to EduForge.
 */

interface ConceptConfidence {
  concept: string;
  subject: string;
  studentConfidence: number;
  aiConfidence: number;
  type: 'overconfident' | 'underconfident' | 'calibrated';
  message: string;
}

// Demo data
const DEMO_DIVERGENCES: ConceptConfidence[] = [
  {
    concept: 'Quadratic Equations',
    subject: 'Mathematics',
    studentConfidence: 0.85,
    aiConfidence: 0.42,
    type: 'overconfident',
    message: "You feel confident, but recent answers show gaps. Let's do some targeted practice.",
  },
  {
    concept: 'Photosynthesis',
    subject: 'Biology',
    studentConfidence: 0.35,
    aiConfidence: 0.78,
    type: 'underconfident',
    message: "You know more than you think! Your recent answers have been strong.",
  },
  {
    concept: "Newton's Third Law",
    subject: 'Physics',
    studentConfidence: 0.72,
    aiConfidence: 0.68,
    type: 'calibrated',
    message: 'Your confidence matches your knowledge well.',
  },
  {
    concept: 'Essay Structure',
    subject: 'English',
    studentConfidence: 0.90,
    aiConfidence: 0.55,
    type: 'overconfident',
    message: 'Your essays are improving but still have structural issues. Debug mode can help.',
  },
  {
    concept: 'Cell Division',
    subject: 'Biology',
    studentConfidence: 0.40,
    aiConfidence: 0.72,
    type: 'underconfident',
    message: "You're getting mitosis questions right consistently. Trust yourself!",
  },
];

export default function ConfidenceWidget() {
  const [showAll, setShowAll] = useState(false);

  const overconfident = DEMO_DIVERGENCES.filter(d => d.type === 'overconfident');
  const underconfident = DEMO_DIVERGENCES.filter(d => d.type === 'underconfident');
  const calibrated = DEMO_DIVERGENCES.filter(d => d.type === 'calibrated');

  const avgCalibration = 1 - DEMO_DIVERGENCES.reduce(
    (sum, d) => sum + Math.abs(d.studentConfidence - d.aiConfidence), 0
  ) / DEMO_DIVERGENCES.length;

  const displayItems = showAll ? DEMO_DIVERGENCES : DEMO_DIVERGENCES.slice(0, 3);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Confidence Tracker</h3>
          <p className="text-slate-500 text-xs mt-0.5">How well your confidence matches reality</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{Math.round(avgCalibration * 100)}%</p>
          <p className="text-xs text-slate-500">calibrated</p>
        </div>
      </div>

      {/* Quick summary */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          <p className="text-red-400 font-bold text-lg">{overconfident.length}</p>
          <p className="text-red-400/70">Overconfident</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
          <p className="text-blue-400 font-bold text-lg">{underconfident.length}</p>
          <p className="text-blue-400/70">Underconfident</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
          <p className="text-green-400 font-bold text-lg">{calibrated.length}</p>
          <p className="text-green-400/70">Calibrated</p>
        </div>
      </div>

      {/* Concept list */}
      <div className="space-y-2">
        {displayItems.map((item, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  item.type === 'overconfident' ? 'bg-red-500' :
                  item.type === 'underconfident' ? 'bg-blue-500' :
                  'bg-green-500'
                }`} />
                <span className="text-white text-sm font-medium">{item.concept}</span>
                <span className="text-xs text-slate-500">{item.subject}</span>
              </div>
            </div>

            {/* Confidence bars */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-8">You</span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.studentConfidence * 100}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 w-8 text-right">{Math.round(item.studentConfidence * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-8">AI</span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.aiConfidence * 100}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 w-8 text-right">{Math.round(item.aiConfidence * 100)}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2">{item.message}</p>
          </div>
        ))}
      </div>

      {DEMO_DIVERGENCES.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {showAll ? 'Show less' : `Show all ${DEMO_DIVERGENCES.length} concepts`}
        </button>
      )}
    </div>
  );
}
