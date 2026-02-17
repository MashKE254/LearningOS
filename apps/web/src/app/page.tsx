'use client';

import { HeroSection, PersonaGrid, HelpMeChoose, FeatureShowcase, Footer } from '@/components/landing';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduForge</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/curricula" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
                Curricula
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
                About
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition text-sm font-medium">
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <HeroSection />

          {/* Persona Cards Grid */}
          <PersonaGrid />

          {/* Help Me Choose Link */}
          <div className="text-center mt-8">
            <HelpMeChoose />
          </div>
        </div>
      </main>

      {/* Trust Indicators */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <div className="text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-gray-500 text-sm">Students Learning</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">15+</div>
              <div className="text-gray-500 text-sm">Curricula Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-gray-500 text-sm">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">4.9</div>
              <div className="text-gray-500 text-sm">Average Rating</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Curriculum Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Aligned to your curriculum
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              EduForge teaches using the exact terminology, sequence, and assessment criteria
              of your exam board. Not generic AI—curriculum-native intelligence.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Cambridge (CIE)', 'IB Diploma', 'KCSE', 'Common Core', 'CBSE', 'Edexcel', 'AQA', 'AP'].map((board) => (
              <div key={board} className="text-lg font-semibold text-gray-400">
                {board}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-violet-600 to-purple-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform how you learn?
            </h2>
            <p className="text-violet-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of students, parents, and teachers who are experiencing
              the future of personalized education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-violet-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
              >
                Start Learning Free
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 bg-violet-500/30 text-white rounded-xl font-semibold text-lg hover:bg-violet-500/40 transition border border-violet-400/30"
              >
                Watch Demo
              </Link>
            </div>
            <p className="text-violet-200 text-sm mt-4">
              No credit card required · Free tier available forever
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
