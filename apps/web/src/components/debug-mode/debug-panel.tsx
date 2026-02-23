'use client';

import { useState } from 'react';

/**
 * Enhanced Debug Mode Panel (Explain My Answer Deep Dive)
 *
 * Goes beyond Duolingo's "Explain My Answer" with:
 * - Side-by-side comparison (what you wrote vs what's correct)
 * - Pattern recognition ("You've made this mistake 3 times")
 * - Counter-examples that force correct reasoning
 * - Verification question to confirm repair
 */

interface DebugItem {
  id: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  subject: string;
  topic: string;
  misconceptionName?: string;
  occurrenceCount: number;
  explanation: string;
  counterExamples: CounterExample[];
  verificationQuestion: VerificationQuestion;
  relatedConcepts: string[];
  status: 'pending' | 'reviewing' | 'verified' | 'needs_retry';
}

interface CounterExample {
  setup: string;
  whyItBreaks: string;
  correctApproach: string;
}

interface VerificationQuestion {
  question: string;
  expectedKeywords: string[];
  hint: string;
}

// Mock debug items for demo
const DEMO_DEBUG_ITEMS: DebugItem[] = [
  {
    id: '1',
    question: 'What is the product of the reaction between sodium and water?',
    studentAnswer: 'Sodium oxide and hydrogen gas',
    correctAnswer: 'Sodium hydroxide (NaOH) and hydrogen gas (H₂)',
    subject: 'Chemistry',
    topic: 'Reactions of Metals',
    misconceptionName: 'Confusing hydroxide with oxide in water reactions',
    occurrenceCount: 3,
    explanation: "When metals react with water, they form metal hydroxides (not oxides). The -OH comes from the water molecule. Metal oxides form when metals react with oxygen gas directly.\n\n**The reaction:** 2Na + 2H₂O → 2NaOH + H₂\n\nNotice the water provides both the OH⁻ and the H₂.",
    counterExamples: [
      {
        setup: 'If sodium formed sodium oxide (Na₂O) with water, where would the extra hydrogen atoms go?',
        whyItBreaks: 'The equation 2Na + 2H₂O → Na₂O + 2H₂ doesn\'t balance for oxygen. Water has an O-H bond that stays intact as hydroxide.',
        correctApproach: 'Think of water (H-OH) splitting: the metal takes the OH part, and the H parts combine to form H₂ gas.',
      },
    ],
    verificationQuestion: {
      question: 'Potassium reacts with water. What are the products? Explain why it\'s not potassium oxide.',
      expectedKeywords: ['potassium hydroxide', 'KOH', 'hydrogen', 'water provides OH'],
      hint: 'Apply the same pattern: metal + water → metal _____ + hydrogen gas',
    },
    relatedConcepts: ['Metal reactivity series', 'Oxide vs Hydroxide', 'Balancing equations'],
    status: 'pending',
  },
  {
    id: '2',
    question: 'Simplify: (x + 3)² ',
    studentAnswer: 'x² + 9',
    correctAnswer: 'x² + 6x + 9',
    subject: 'Mathematics',
    topic: 'Algebraic Expansion',
    misconceptionName: 'Forgetting the middle term in binomial expansion',
    occurrenceCount: 5,
    explanation: "This is one of the most common algebra mistakes. (x + 3)² means (x + 3)(x + 3), NOT x² + 3².\n\nUsing FOIL:\n- **F**irst: x × x = x²\n- **O**uter: x × 3 = 3x\n- **I**nner: 3 × x = 3x\n- **L**ast: 3 × 3 = 9\n\nSo: x² + 3x + 3x + 9 = **x² + 6x + 9**\n\nThe middle term (6x) comes from the cross-multiplication. It's always 2ab when expanding (a + b)².",
    counterExamples: [
      {
        setup: 'If (x + 3)² = x² + 9, then substituting x = 1: (1 + 3)² should equal 1² + 9',
        whyItBreaks: '(1 + 3)² = 4² = 16, but 1² + 9 = 10. They\'re not equal! The missing 6x term accounts for the difference (6 × 1 = 6, and 10 + 6 = 16).',
        correctApproach: 'Always use the formula (a+b)² = a² + 2ab + b², or expand by multiplying (a+b)(a+b) fully.',
      },
    ],
    verificationQuestion: {
      question: 'Expand (x + 5)². Show all your working and explain where each term comes from.',
      expectedKeywords: ['x²', '10x', '25', '2ab', 'FOIL', 'middle term'],
      hint: 'Remember: (a + b)² = a² + 2ab + b². What is a? What is b?',
    },
    relatedConcepts: ['FOIL method', 'Perfect square trinomials', 'Factoring'],
    status: 'pending',
  },
];

export default function DebugPanel() {
  const [debugItems] = useState<DebugItem[]>(DEMO_DEBUG_ITEMS);
  const [activeItem, setActiveItem] = useState<DebugItem | null>(null);
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [showCounterExample, setShowCounterExample] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'correct' | 'incorrect' | null>(null);
  const [expandedStep, setExpandedStep] = useState<number>(1);

  const handleVerify = () => {
    if (!activeItem) return;
    const answer = verificationAnswer.toLowerCase();
    const hasKeywords = activeItem.verificationQuestion.expectedKeywords.some(
      kw => answer.includes(kw.toLowerCase())
    );
    setVerificationResult(hasKeywords ? 'correct' : 'incorrect');
  };

  if (activeItem) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => {
            setActiveItem(null);
            setVerificationAnswer('');
            setVerificationResult(null);
            setShowCounterExample(false);
            setExpandedStep(1);
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Debug Queue
        </button>

        {/* Pattern Alert */}
        {activeItem.occurrenceCount >= 3 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-amber-400 font-medium">Recurring Pattern Detected</p>
                <p className="text-amber-300/70 text-sm">
                  You&apos;ve made this type of mistake {activeItem.occurrenceCount} times:
                  <span className="font-medium text-amber-300"> {activeItem.misconceptionName}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Side-by-Side Comparison */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedStep(expandedStep === 1 ? 0 : 1)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-sm">1</div>
              <span className="font-medium text-white">What Happened</span>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedStep === 1 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedStep === 1 && (
            <div className="px-4 pb-4 space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-slate-500 mb-2">Question</p>
                <p className="text-white">{activeItem.question}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-sm text-red-400 mb-2 font-medium">Your Answer</p>
                  <p className="text-red-300">{activeItem.studentAnswer}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <p className="text-sm text-green-400 mb-2 font-medium">Correct Answer</p>
                  <p className="text-green-300">{activeItem.correctAnswer}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Explanation */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedStep(expandedStep === 2 ? 0 : 2)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">2</div>
              <span className="font-medium text-white">Why It&apos;s Wrong</span>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedStep === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedStep === 2 && (
            <div className="px-4 pb-4">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">{activeItem.explanation}</div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Counter-Examples */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => {
              setExpandedStep(expandedStep === 3 ? 0 : 3);
              setShowCounterExample(true);
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">3</div>
              <span className="font-medium text-white">Prove It Wrong</span>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedStep === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedStep === 3 && showCounterExample && (
            <div className="px-4 pb-4 space-y-4">
              {activeItem.counterExamples.map((ce, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <p className="text-sm text-purple-400 mb-1 font-medium">Think about this:</p>
                    <p className="text-purple-200">{ce.setup}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-sm text-red-400 mb-1 font-medium">Why your approach breaks:</p>
                    <p className="text-red-200">{ce.whyItBreaks}</p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-sm text-green-400 mb-1 font-medium">The correct approach:</p>
                    <p className="text-green-200">{ce.correctApproach}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Verification */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandedStep(expandedStep === 4 ? 0 : 4)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">4</div>
              <span className="font-medium text-white">Verify Your Understanding</span>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedStep === 4 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedStep === 4 && (
            <div className="px-4 pb-4 space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-white font-medium mb-2">{activeItem.verificationQuestion.question}</p>
                <p className="text-slate-500 text-sm">Hint: {activeItem.verificationQuestion.hint}</p>
              </div>
              <textarea
                value={verificationAnswer}
                onChange={(e) => setVerificationAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-500 resize-none"
                rows={4}
              />
              <button
                onClick={handleVerify}
                disabled={!verificationAnswer.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Check My Understanding
              </button>
              {verificationResult === 'correct' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 font-medium">Excellent! You&apos;ve demonstrated understanding.</p>
                  <p className="text-green-300/70 text-sm mt-1">This misconception has been marked as resolving. Keep it up!</p>
                </div>
              )}
              {verificationResult === 'incorrect' && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-400 font-medium">Not quite there yet.</p>
                  <p className="text-amber-300/70 text-sm mt-1">Try re-reading the explanation and counter-examples. Focus on: {activeItem.verificationQuestion.expectedKeywords.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Concepts */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-sm text-slate-500 mb-3">Related concepts to review:</p>
          <div className="flex flex-wrap gap-2">
            {activeItem.relatedConcepts.map((concept, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg hover:bg-slate-700 cursor-pointer transition-colors">
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Debug Mode</h2>
        <p className="text-slate-400 text-sm">Understand your mistakes deeply. Fix misconceptions permanently.</p>
      </div>

      {/* Debug Queue */}
      <div className="space-y-3">
        {debugItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="w-full text-left bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-amber-500/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">{item.subject}</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded">{item.topic}</span>
                  {item.occurrenceCount >= 3 && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                      {item.occurrenceCount}x repeated
                    </span>
                  )}
                </div>
                <p className="text-white font-medium truncate group-hover:text-amber-400 transition-colors">
                  {item.question}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs text-slate-500">Your answer: {item.studentAnswer}</span>
                  </div>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {debugItems.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-white font-medium mb-1">All caught up!</h3>
          <p className="text-slate-400 text-sm">No misconceptions to debug right now. Keep learning!</p>
        </div>
      )}
    </div>
  );
}
