'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/providers';
import { mockApi } from '@/lib/mock-api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Array<{ source: string; content: string } | string>;
  responseType?: string;
}

type SessionMode = 'SCHOOL_STUFF' | 'LEARN_SOMETHING_NEW' | 'EXAM_PREP';

const modes: { value: SessionMode; label: string; description: string; icon: JSX.Element }[] = [
  {
    value: 'SCHOOL_STUFF',
    label: 'School Stuff',
    description: 'Homework help & class topics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: 'LEARN_SOMETHING_NEW',
    label: 'Learn Something New',
    description: 'Explore new topics & skills',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    value: 'EXAM_PREP',
    label: 'Exam Prep',
    description: 'Past papers & intensive review',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const quickPrompts = [
  "Help me understand quadratic equations",
  "Explain photosynthesis step by step",
  "What's the difference between mitosis and meiosis?",
  "How do I solve this chemistry problem?",
];

export default function StudentChatPage() {
  const { isDemoMode } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<SessionMode>('SCHOOL_STUFF');
  const [showModeSelector, setShowModeSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowModeSelector(false);

    try {
      let data;
      
      if (isDemoMode) {
        // Use mock API in demo mode
        const result = await mockApi.chat(content, sessionId, mode);
        data = result.data;
      } else {
        // Use real API
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/tutor/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: content,
            sessionId,
            mode,
          }),
        });

        data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to get response');
        }
      }

      setSessionId(data.session.id);

      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.response.content,
        timestamp: new Date(),
        citations: data.response.citations,
        responseType: data.response.type,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: "I'm sorry, I couldn't process your message. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setShowModeSelector(true);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-none h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg">
            {modes.find(m => m.value === mode)?.icon}
            <span className="text-slate-300 text-sm font-medium">
              {modes.find(m => m.value === mode)?.label}
            </span>
          </div>
          {sessionId && (
            <span className="text-slate-500 text-sm">
              Session active
            </span>
          )}
        </div>
        <button
          onClick={startNewChat}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && showModeSelector ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">What would you like to learn?</h1>
            <p className="text-slate-400 text-center mb-8 max-w-md">
              I'm your AI tutor. I'll guide you through concepts using questions, 
              not just give you answers.
            </p>

            {/* Mode selector */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition ${
                    mode === m.value
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {m.icon}
                  <span className="font-medium text-white">{m.label}</span>
                  <span className="text-xs text-center">{m.description}</span>
                </button>
              ))}
            </div>

            {/* Quick prompts */}
            <div className="w-full max-w-2xl">
              <p className="text-slate-500 text-sm mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-full transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-none w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <div className="text-xs text-slate-500 mb-2">Sources:</div>
                      {message.citations.map((citation, i) => (
                        <div key={i} className="text-xs text-slate-400">
                          • {typeof citation === 'string' ? citation : citation.source}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-none w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="bg-slate-800 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-none border-t border-slate-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2">
            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 focus-within:border-indigo-500 transition">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Shift+Enter for new line)"
                className="w-full px-4 py-3 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex-none w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-slate-600 text-xs mt-3">
            EduForge helps you learn through guided questions, not direct answers
          </p>
        </form>
      </div>
    </div>
  );
}
