'use client';

import { useState, useEffect } from 'react';

interface DebugItem {
  id: string;
  misconceptionName: string;
  subject: string;
  concept: string;
  occurrenceCount: number;
  wrongAnswer: string;
  correctAnswer: string;
  status: 'active' | 'in_progress' | 'resolved';
}

interface DebugSession {
  item: DebugItem;
  step: 'identify' | 'explain' | 'contrast' | 'verify';
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  verificationAnswer?: string;
  resolved: boolean;
}

export default function DebugPage() {
  const [misconceptions, setMisconceptions] = useState<DebugItem[]>([]);
  const [activeSession, setActiveSession] = useState<DebugSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [aiStatus, setAiStatus] = useState<{ connected: boolean; model?: string }>({ connected: false });

  // Check AI status and load misconceptions
  useEffect(() => {
    checkAIStatus();
    loadMisconceptions();
  }, []);

  async function checkAIStatus() {
    try {
      const response = await fetch('/api/chat?action=status');
      const data = await response.json();
      setAiStatus({
        connected: data.status === 'connected',
        model: data.currentModel,
      });
    } catch {
      setAiStatus({ connected: false });
    }
  }

  function loadMisconceptions() {
    // Simulated misconception data from knowledge graph
    setMisconceptions([
      {
        id: '1',
        misconceptionName: 'Sign errors in equation solving',
        subject: 'Mathematics',
        concept: 'Linear Equations',
        occurrenceCount: 8,
        wrongAnswer: 'When solving 3x - 5 = 10, student wrote: 3x = 10 - 5',
        correctAnswer: 'Should be: 3x = 10 + 5 (adding 5 to both sides)',
        status: 'active',
      },
      {
        id: '2',
        misconceptionName: 'Confusing ionic and covalent bonds',
        subject: 'Chemistry',
        concept: 'Chemical Bonding',
        occurrenceCount: 5,
        wrongAnswer: 'Student said NaCl forms covalent bonds because it shares electrons',
        correctAnswer: 'NaCl forms ionic bonds - Na transfers an electron to Cl',
        status: 'active',
      },
      {
        id: '3',
        misconceptionName: 'Mitosis vs Meiosis confusion',
        subject: 'Biology',
        concept: 'Cell Division',
        occurrenceCount: 3,
        wrongAnswer: 'Student said mitosis produces 4 cells',
        correctAnswer: 'Mitosis produces 2 identical cells; Meiosis produces 4',
        status: 'in_progress',
      },
      {
        id: '4',
        misconceptionName: 'Subject-verb agreement with collective nouns',
        subject: 'English',
        concept: 'Grammar',
        occurrenceCount: 6,
        wrongAnswer: '"The team are playing well" (British vs American English confusion)',
        correctAnswer: 'In American English: "The team is playing well"',
        status: 'active',
      },
    ]);
  }

  async function startDebugSession(item: DebugItem) {
    setActiveSession({
      item,
      step: 'identify',
      messages: [],
      resolved: false,
    });
    setIsLoading(true);

    // Start the 4-step debug process with AI
    const identifyPrompt = `I'm having trouble with ${item.concept} in ${item.subject}.
I keep making this mistake: "${item.wrongAnswer}"
The correct answer should be: "${item.correctAnswer}"

This has happened ${item.occurrenceCount} times. Can you help me understand what I'm doing wrong?`;

    await sendMessage(identifyPrompt, 'identify');
  }

  async function sendMessage(content: string, currentStep?: string) {
    if (!activeSession && !currentStep) return;

    setIsLoading(true);

    const messages = activeSession?.messages || [];
    const newMessages = [...messages, { role: 'user' as const, content }];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          mode: 'DEBUG',
          newSession: messages.length === 0,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage = data.response?.content || 'No response received';

      setActiveSession(prev => prev ? {
        ...prev,
        messages: [...newMessages, { role: 'assistant', content: assistantMessage }],
        step: getNextStep(currentStep || prev.step),
      } : null);
    } catch (error) {
      console.error('Debug chat error:', error);
      // Provide fallback response
      const fallbackResponse = getFallbackResponse(currentStep || activeSession?.step || 'identify', activeSession?.item);
      setActiveSession(prev => prev ? {
        ...prev,
        messages: [...newMessages, { role: 'assistant', content: fallbackResponse }],
        step: getNextStep(currentStep || prev.step),
      } : null);
    }

    setIsLoading(false);
  }

  function getNextStep(current: string): 'identify' | 'explain' | 'contrast' | 'verify' {
    const steps: ('identify' | 'explain' | 'contrast' | 'verify')[] = ['identify', 'explain', 'contrast', 'verify'];
    const currentIndex = steps.indexOf(current as typeof steps[number]);
    return steps[Math.min(currentIndex + 1, steps.length - 1)];
  }

  function getFallbackResponse(step: string, item?: DebugItem): string {
    if (!item) return 'Let me help you understand this concept better.';

    switch (step) {
      case 'identify':
        return `I can see you're struggling with **${item.misconceptionName}** in ${item.concept}.

This is actually a very common mistake! You've made it ${item.occurrenceCount} times, which tells me we need to really nail down the underlying concept.

**What went wrong:**
${item.wrongAnswer}

**What should happen:**
${item.correctAnswer}

Let me explain why this happens...`;

      case 'explain':
        return `**Why this misconception happens:**

Many students make this mistake because the concept can seem counterintuitive at first. Here's the key insight you need:

The fundamental principle is that we need to think about this step by step.

Would you like me to show you a side-by-side comparison of wrong vs. correct thinking?`;

      case 'contrast':
        return `**Side-by-Side Comparison:**

| Wrong Thinking | Correct Thinking |
|----------------|------------------|
| ${item.wrongAnswer} | ${item.correctAnswer} |

**Key Difference:**
The main thing to notice is how the correct approach handles the operation differently.

Let me ask you a verification question to check your understanding...`;

      case 'verify':
        return `**Verification Question:**

Based on what we've discussed, try this similar problem:

Think about a situation where you might apply this concept. How would you approach it differently now?

Take your time and type your answer below. I'll help you check if you've got it!`;

      default:
        return 'Let me help you work through this step by step.';
    }
  }

  function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  }

  function advanceStep() {
    if (!activeSession) return;

    const stepPrompts: Record<string, string> = {
      identify: "Now that we've identified the misconception, can you explain why this error happens?",
      explain: "Can you show me a side-by-side comparison of wrong vs correct thinking?",
      contrast: "Now give me a verification question to test my understanding.",
    };

    const prompt = stepPrompts[activeSession.step];
    if (prompt) {
      sendMessage(prompt);
    }
  }

  function markResolved() {
    if (!activeSession) return;

    // Update misconception status
    setMisconceptions(prev =>
      prev.map(m =>
        m.id === activeSession.item.id ? { ...m, status: 'resolved' as const } : m
      )
    );

    setActiveSession(null);
  }

  const stepLabels = {
    identify: '1. Identify',
    explain: '2. Explain',
    contrast: '3. Contrast',
    verify: '4. Verify',
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Debug Mode</h1>
          <p className="text-slate-400">
            Work through your misconceptions with AI-guided 4-step correction
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${aiStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-slate-400">
              {aiStatus.connected ? `AI Connected (${aiStatus.model})` : 'AI Offline - Using templates'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Misconceptions List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Your Misconceptions</h2>

              {misconceptions.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No active misconceptions</p>
              ) : (
                <div className="space-y-3">
                  {misconceptions.map(item => (
                    <button
                      key={item.id}
                      onClick={() => startDebugSession(item)}
                      disabled={activeSession !== null}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        item.status === 'resolved'
                          ? 'bg-green-500/10 border-green-500/30'
                          : item.status === 'in_progress'
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-slate-800 border-slate-700 hover:border-indigo-500'
                      } ${activeSession !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-400">
                          {item.subject} · {item.concept}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.status === 'resolved'
                            ? 'bg-green-500/20 text-green-400'
                            : item.status === 'in_progress'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.occurrenceCount}x
                        </span>
                      </div>
                      <h3 className="text-white font-medium mb-1">{item.misconceptionName}</h3>
                      <p className="text-slate-400 text-sm truncate">{item.wrongAnswer}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Debug Session */}
          <div className="lg:col-span-2">
            {!activeSession ? (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Select a Misconception to Debug</h3>
                <p className="text-slate-400">
                  Choose a misconception from the list to start a guided correction session.
                  The AI will walk you through 4 steps: Identify, Explain, Contrast, and Verify.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-[600px]">
                {/* Session Header */}
                <div className="p-4 border-b border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">
                      Debugging: {activeSession.item.misconceptionName}
                    </h2>
                    <button
                      onClick={() => setActiveSession(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex gap-2">
                    {Object.entries(stepLabels).map(([key, label]) => (
                      <div
                        key={key}
                        className={`flex-1 h-2 rounded ${
                          key === activeSession.step
                            ? 'bg-indigo-500'
                            : Object.keys(stepLabels).indexOf(key) < Object.keys(stepLabels).indexOf(activeSession.step)
                            ? 'bg-green-500'
                            : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {Object.entries(stepLabels).map(([key, label]) => (
                      <span
                        key={key}
                        className={`text-xs ${
                          key === activeSession.step ? 'text-indigo-400' : 'text-slate-500'
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeSession.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-800">
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Type your response..."
                      disabled={isLoading}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !chatInput.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
                    >
                      Send
                    </button>
                  </form>

                  {/* Step Actions */}
                  <div className="flex gap-2 mt-3">
                    {activeSession.step !== 'verify' ? (
                      <button
                        onClick={advanceStep}
                        disabled={isLoading}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg transition"
                      >
                        Continue to Next Step →
                      </button>
                    ) : (
                      <button
                        onClick={markResolved}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                      >
                        Mark as Resolved ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
