'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-white">EduForge</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-slate-400 hover:text-white transition">Features</Link>
              <Link href="#how-it-works" className="text-slate-400 hover:text-white transition">How It Works</Link>
              <Link href="#pricing" className="text-slate-400 hover:text-white transition">Pricing</Link>
              <Link href="/login" className="text-slate-400 hover:text-white transition">Login</Link>
              <Link 
                href="/signup" 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block text-slate-400 hover:text-white">Features</Link>
              <Link href="#how-it-works" className="block text-slate-400 hover:text-white">How It Works</Link>
              <Link href="#pricing" className="block text-slate-400 hover:text-white">Pricing</Link>
              <Link href="/login" className="block text-slate-400 hover:text-white">Login</Link>
              <Link href="/signup" className="block px-4 py-2 bg-indigo-600 text-white rounded-lg text-center">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-indigo-300 text-sm">Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Your Personal AI Tutor
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              That Actually Teaches
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            EduForge uses Socratic questioning to help you truly understand concepts, 
            not just memorize answers. Aligned with your actual curriculum and exam board.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-indigo-500/25"
            >
              Start Learning Free
            </Link>
            <Link 
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              Watch Demo
            </Link>
          </div>

          <p className="text-slate-500 text-sm mt-4">No credit card required · Works with IGCSE, A-Level, KCSE & more</p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-slate-500">Students Learning</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">15+</div>
              <div className="text-slate-500">Curricula Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">2M+</div>
              <div className="text-slate-500">Questions Answered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">4.9★</div>
              <div className="text-slate-500">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Not Another Chatbot
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              EduForge is built from the ground up for education, with features designed 
              to help you actually learn and succeed in your exams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Socratic Method</h3>
              <p className="text-slate-400">
                We don't give you answers. We guide you to discover them yourself through 
                strategic questions that build real understanding.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Your Actual Syllabus</h3>
              <p className="text-slate-400">
                Content is pulled directly from your exam board's syllabus. IGCSE, A-Level, 
                KCSE, Common Core – we've got you covered.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Verified Accuracy</h3>
              <p className="text-slate-400">
                Math and science answers are verified through computational engines before 
                reaching you. No hallucinations, just facts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Exam Prep Mode</h3>
              <p className="text-slate-400">
                Got an exam tomorrow? Crisis mode adapts to your deadline with past paper 
                questions, marking schemes, and intensive review.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Bilingual Support</h3>
              <p className="text-slate-400">
                Concepts explained in your native language first, then bridged to academic 
                English. Perfect for international students.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Parent Dashboard</h3>
              <p className="text-slate-400">
                Real-time visibility into your child's learning. See what they're studying, 
                where they struggle, and when they need extra support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Learning That Actually Works
            </h2>
            <p className="text-slate-400 text-lg">
              From homework help to exam prep, EduForge adapts to how you learn best.
            </p>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2">
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">You</div>
                      <div className="flex-1 bg-indigo-500/20 rounded-lg p-3 text-slate-300">
                        I don't understand why (x+2)² isn't x² + 4
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">AI</div>
                      <div className="flex-1 bg-slate-700 rounded-lg p-3 text-slate-300">
                        Let's explore this together! When you have (x+2)², you're multiplying (x+2) by itself. Can you write that out as (x+2)(x+2) and try expanding it step by step?
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 md:pl-8">
                <div className="text-indigo-400 font-semibold mb-2">Step 1</div>
                <h3 className="text-2xl font-bold text-white mb-3">Ask Your Question</h3>
                <p className="text-slate-400">
                  Upload homework, type a question, or snap a photo. EduForge understands 
                  what you're stuck on and starts a guided conversation.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="w-full md:w-1/2">
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">Quadratic Expansion</div>
                        <div className="text-green-400 text-sm">Mastered ✓</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">Factorization</div>
                        <div className="text-yellow-400 text-sm">In Progress</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white font-medium">Quadratic Formula</div>
                        <div className="text-slate-500 text-sm">Locked (needs prerequisites)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 md:pr-8">
                <div className="text-indigo-400 font-semibold mb-2">Step 2</div>
                <h3 className="text-2xl font-bold text-white mb-3">Build Your Knowledge Graph</h3>
                <p className="text-slate-400">
                  Every concept you master unlocks the next. We track your actual understanding, 
                  not just completed lessons, so nothing falls through the cracks.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2">
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white mb-2">A*</div>
                    <div className="text-slate-400 mb-4">Predicted Grade</div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-4/5"></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-slate-500">Current: 78%</span>
                      <span className="text-indigo-400">Target: 85%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 md:pl-8">
                <div className="text-indigo-400 font-semibold mb-2">Step 3</div>
                <h3 className="text-2xl font-bold text-white mb-3">Crush Your Exams</h3>
                <p className="text-slate-400">
                  Practice with real past paper questions, get instant feedback on your answers, 
                  and see exactly where you need to focus before exam day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 text-lg">
              Start free, upgrade when you're ready. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-slate-400 font-medium mb-2">Free</div>
              <div className="text-4xl font-bold text-white mb-1">$0</div>
              <div className="text-slate-500 mb-6">Forever</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  10 questions per day
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic curriculum access
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Knowledge tracking
                </li>
              </ul>
              <Link 
                href="/signup"
                className="block w-full py-3 text-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
              >
                Get Started
              </Link>
            </div>

            {/* Student Pro */}
            <div className="bg-gradient-to-b from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-sm font-medium rounded-full">
                Most Popular
              </div>
              <div className="text-indigo-400 font-medium mb-2">Student Pro</div>
              <div className="text-4xl font-bold text-white mb-1">$29</div>
              <div className="text-slate-500 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited questions
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All curricula & exam boards
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Past paper practice
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority AI responses
                </li>
              </ul>
              <Link 
                href="/signup?plan=pro"
                className="block w-full py-3 text-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Family */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-slate-400 font-medium mb-2">Family Pro</div>
              <div className="text-4xl font-bold text-white mb-1">$79</div>
              <div className="text-slate-500 mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 4 students
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Parent dashboard
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Progress reports
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All Student Pro features
                </li>
              </ul>
              <Link 
                href="/signup?plan=family"
                className="block w-full py-3 text-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-500 mt-8">
            Schools & institutions: <Link href="/contact" className="text-indigo-400 hover:underline">Contact us</Link> for volume pricing starting at $14/student/year
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join thousands of students who are finally understanding their subjects, 
            not just memorizing for exams.
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-indigo-500/25"
          >
            Start Learning Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-slate-400 hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="text-slate-400 hover:text-white">Pricing</Link></li>
                <li><Link href="/curricula" className="text-slate-400 hover:text-white">Curricula</Link></li>
                <li><Link href="/schools" className="text-slate-400 hover:text-white">For Schools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-slate-400 hover:text-white">Blog</Link></li>
                <li><Link href="/help" className="text-slate-400 hover:text-white">Help Center</Link></li>
                <li><Link href="/api" className="text-slate-400 hover:text-white">API</Link></li>
                <li><Link href="/status" className="text-slate-400 hover:text-white">Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-slate-400 hover:text-white">About</Link></li>
                <li><Link href="/careers" className="text-slate-400 hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-white">Contact</Link></li>
                <li><Link href="/press" className="text-slate-400 hover:text-white">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-slate-400 hover:text-white">Privacy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white">Terms</Link></li>
                <li><Link href="/cookies" className="text-slate-400 hover:text-white">Cookies</Link></li>
                <li><Link href="/security" className="text-slate-400 hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">E</span>
              </div>
              <span className="text-slate-400">© 2026 EduForge. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://twitter.com/eduforge" className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com/eduforge" className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
