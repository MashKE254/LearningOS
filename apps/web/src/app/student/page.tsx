'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMode, MODE_CONFIGS } from '@/lib/modes';
import { ModeSwitcher, ModeSuggestion, ModeStatusBar } from '@/components/modes';
import { CanvasProvider, CanvasToolbar, CanvasWorkArea } from '@/components/canvas';
import {
  MessageSquare,
  Maximize2,
  Minimize2,
  Send,
  Sparkles,
  BookOpen,
  Target,
  Flame,
  ChevronRight,
  Brain,
  Lightbulb,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thinkingTrace?: string;
}

interface StudySession {
  subject: string;
  curriculum: string;
  currentTopic: string;
  streak: number;
  todayMinutes: number;
  weeklyGoalMinutes: number;
}

export default function StudentDashboard() {
  const { state, config } = useMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);
  const [showThinkingTrace, setShowThinkingTrace] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<StudySession>({
    subject: 'Mathematics',
    curriculum: 'CIE A-Level',
    currentTopic: 'Calculus - Integration by Parts',
    streak: 7,
    todayMinutes: 45,
    weeklyGoalMinutes: 300,
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('student_onboarding');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setSession((prev) => ({
          ...prev,
          subject: data.subject || prev.subject,
          curriculum: data.curriculum || prev.curriculum,
        }));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Welcome back! You're continuing with **${session.currentTopic}**. I noticed you've been doing great with basic integration - ready to tackle integration by parts?\n\nLet's start with a concept check: Can you explain in your own words what the product rule for differentiation is?`,
          timestamp: new Date(),
          thinkingTrace:
            "Student has completed 3 sessions on integration. Last session showed 80% accuracy on basic integration. Integration by parts builds on the product rule, so I'll check their understanding of that prerequisite concept first using the Socratic method.",
        },
      ]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: getAIResponse(input, state.currentMode),
        timestamp: new Date(),
        thinkingTrace: config.aiBehavior.thinkingTracesVisible
          ? "Student's response shows partial understanding. They correctly identified the concept but missed a key detail. I'll ask a follow-up question to guide them to the full understanding rather than correcting directly."
          : undefined,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string, mode: string): string => {
    // Simulated responses based on mode
    const responses: Record<string, string> = {
      LEARN:
        "That's a good start! You mentioned that the product rule involves derivatives of two functions. Let me ask you this: if we have two functions u(x) and v(x), and we know d/dx[u·v] = u'v + uv', how might we \"reverse\" this for integration?\n\nTake a moment to think about it. What would happen if we integrated both sides of the product rule equation?",
      PRACTICE:
        "Good attempt! Let's work through this together.\n\n**Hint 1:** Remember, integration by parts comes from reversing the product rule.\n\nTry setting u = x and dv = e^x dx. What would du and v be?",
      EXAM: 'Answer recorded. Moving to the next question...',
      DEBUG:
        "I see where the confusion happened. When you applied the formula, you forgot to include the negative sign in front of the integral.\n\nThe correct formula is: ∫u dv = uv - ∫v du\n\nNotice the **minus** sign before the second integral. This is a common mistake! Let's redo this step together.",
      REVIEW:
        "**Integration by Parts Formula**\n\n∫u dv = uv - ∫v du\n\nHow confident do you feel about this concept?\n\n[1] Not confident - need more practice\n[2] Somewhat confident\n[3] Very confident",
    };
    return responses[mode] || responses.LEARN;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white`}
              >
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">{session.subject}</h1>
                <p className="text-xs text-gray-500">{session.curriculum}</p>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div className="text-sm">
              <span className="text-gray-500">Topic:</span>{' '}
              <span className="text-gray-900 font-medium">{session.currentTopic}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-lg">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">
                {session.streak} day streak
              </span>
            </div>

            {/* Mode Switcher */}
            <ModeSwitcher />

            {/* Status Bar */}
            <ModeStatusBar className="hidden lg:flex" />
          </div>
        </div>
      </header>

      {/* Mode Suggestion Banner */}
      <ModeSuggestion className="px-4 pt-4 max-w-7xl mx-auto w-full" />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-4 gap-4">
        {/* Chat Area */}
        <div
          className={`flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${
            isCanvasExpanded ? 'w-1/3' : 'flex-1'
          }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">
                {config.name} Mode
              </span>
            </div>
            {config.aiBehavior.thinkingTracesVisible && (
              <button
                onClick={() => setShowThinkingTrace(!showThinkingTrace)}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${
                  showThinkingTrace
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Lightbulb className="w-3 h-3" />
                Thinking Traces
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-violet-600 text-white rounded-2xl rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md'
                  } px-4 py-3`}
                >
                  {/* Thinking Trace */}
                  {showThinkingTrace &&
                    message.thinkingTrace &&
                    message.role === 'assistant' && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-1 text-xs text-violet-600 mb-1">
                          <Brain className="w-3 h-3" />
                          AI Thinking
                        </div>
                        <p className="text-xs text-gray-500 italic">
                          {message.thinkingTrace}
                        </p>
                      </div>
                    )}

                  <div
                    className={`prose prose-sm max-w-none ${
                      message.role === 'user' ? 'prose-invert' : ''
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    config.aiBehavior.socraticLevel === 'off'
                      ? 'Enter your answer...'
                      : 'Type your response or ask a question...'
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Confidence Input */}
            {config.aiBehavior.confidenceInputEnabled && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-gray-500">How confident?</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-colors"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className={`flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${
            isCanvasExpanded ? 'flex-1' : 'w-96'
          }`}
        >
          <CanvasProvider>
            {/* Canvas Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="font-medium text-gray-900">Work Area</span>
              <button
                onClick={() => setIsCanvasExpanded(!isCanvasExpanded)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                {isCanvasExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Canvas Toolbar */}
            <CanvasToolbar
              availableTools={config.ui.canvasTools}
              className="border-b border-gray-200"
            />

            {/* Canvas Work Area */}
            <CanvasWorkArea className="flex-1" minHeight="200px" />
          </CanvasProvider>
        </div>
      </main>

      {/* Exam Lens Overlay (when enabled) */}
      {config.ui.showExamLens && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-72">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-red-500" />
            <span className="font-medium text-gray-900 text-sm">Exam Relevance</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Integration by Parts</span>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                High Priority
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Appears in 3-4 questions per exam. Often combined with trigonometric
              substitution.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
              <BookOpen className="w-3 h-3" />
              <span>Past papers: 2022 Q7, 2021 Q5</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
