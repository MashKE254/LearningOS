'use client';

import { useState } from 'react';

interface Problem {
  question: string;
  hints: string[];
  difficulty: number;
  topic: string;
  marks: number;
}

interface Topic {
  id: string;
  name: string;
  subject: string;
  mastery: number;
}

const mockTopics: Topic[] = [
  { id: '1', name: 'Quadratic Equations', subject: 'Mathematics', mastery: 0.65 },
  { id: '2', name: 'Photosynthesis', subject: 'Biology', mastery: 0.82 },
  { id: '3', name: 'Chemical Bonding', subject: 'Chemistry', mastery: 0.45 },
  { id: '4', name: 'Forces & Motion', subject: 'Physics', mastery: 0.71 },
  { id: '5', name: 'Essay Writing', subject: 'English', mastery: 0.58 },
];

export default function PracticePage() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const generateProblems = async (topic: Topic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setProblems([]);
    setCurrentProblemIndex(0);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tutor/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: topic.id,
          count: 5,
          focusOnMisconceptions: topic.mastery < 0.5,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate problems');

      const data = await res.json();
      setProblems(data.problems);
    } catch (error) {
      console.error('Error generating problems:', error);
      // Fallback mock problems
      setProblems([
        {
          question: `Practice problem 1 for ${topic.name}: Solve the following...`,
          hints: ['Think about the basic formula', 'Consider the variables involved', 'Check your units'],
          difficulty: 3,
          topic: topic.name,
          marks: 4,
        },
        {
          question: `Practice problem 2 for ${topic.name}: Calculate...`,
          hints: ['Start with the given information', 'Apply the relevant equation'],
          difficulty: 2,
          topic: topic.name,
          marks: 3,
        },
        {
          question: `Practice problem 3 for ${topic.name}: Explain...`,
          hints: ['Consider the key concepts', 'Use specific terminology'],
          difficulty: 4,
          topic: topic.name,
          marks: 5,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = () => {
    if (!userAnswer.trim()) return;
    
    // Simulate checking (in production, this would call the API)
    setFeedback("Great attempt! Let me guide you through this. What was your first step in solving this problem?");
  };

  const nextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setUserAnswer('');
      setShowHint(false);
      setHintIndex(0);
      setFeedback(null);
    }
  };

  const getNextHint = () => {
    const problem = problems[currentProblemIndex];
    if (hintIndex < problem.hints.length - 1) {
      setHintIndex(prev => prev + 1);
    }
    setShowHint(true);
  };

  if (!selectedTopic) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">Practice Problems</h1>
          <p className="text-slate-400 mb-8">
            Select a topic to practice. Problems are generated based on your mastery level.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {mockTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => generateProblems(topic)}
                className="flex items-start gap-4 p-4 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition text-left group"
              >
                <div className="flex-none w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">
                    {topic.subject === 'Mathematics' && '∑'}
                    {topic.subject === 'Biology' && '🧬'}
                    {topic.subject === 'Chemistry' && '⚗️'}
                    {topic.subject === 'Physics' && '⚡'}
                    {topic.subject === 'English' && '📝'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium group-hover:text-indigo-400 transition">
                    {topic.name}
                  </div>
                  <div className="text-slate-500 text-sm">{topic.subject}</div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Mastery</span>
                      <span className={`font-medium ${
                        topic.mastery >= 0.8 ? 'text-green-400' :
                        topic.mastery >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {Math.round(topic.mastery * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          topic.mastery >= 0.8 ? 'bg-green-500' :
                          topic.mastery >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${topic.mastery * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Generating practice problems...</p>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to topics
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">
              Problem {currentProblemIndex + 1} of {problems.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentProblemIndex + 1) / problems.length) * 100}%` }}
          />
        </div>

        {/* Problem card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-indigo-400 text-sm font-medium">{selectedTopic.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">{currentProblem?.marks} marks</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level}
                    className={`w-2 h-2 rounded-full ${
                      level <= (currentProblem?.difficulty || 0) ? 'bg-yellow-500' : 'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-white text-lg leading-relaxed">
            {currentProblem?.question}
          </p>
        </div>

        {/* Hints */}
        {showHint && currentProblem && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <div className="text-yellow-500 font-medium mb-1">Hint {hintIndex + 1}</div>
                <p className="text-yellow-200/80">{currentProblem.hints[hintIndex]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-500/30 rounded-lg flex items-center justify-center flex-none">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-indigo-200/80">{feedback}</p>
            </div>
          </div>
        )}

        {/* Answer input */}
        <div className="mb-6">
          <label className="block text-slate-400 text-sm mb-2">Your answer</label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your solution here..."
            className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={getNextHint}
            disabled={showHint && currentProblem && hintIndex >= currentProblem.hints.length - 1}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Get Hint
          </button>
          <button
            onClick={submitAnswer}
            disabled={!userAnswer.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            Check Answer
          </button>
          {feedback && currentProblemIndex < problems.length - 1 && (
            <button
              onClick={nextProblem}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition ml-auto"
            >
              Next Problem →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
