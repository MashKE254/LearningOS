'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="text-center mb-12">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200 mb-6"
      >
        <Sparkles className="w-4 h-4 text-violet-600" />
        <span className="text-sm font-medium text-violet-700">
          Curriculum-Native AI Teaching Engine
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
      >
        How can{' '}
        <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          EduForge
        </span>{' '}
        help you today?
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-2"
      >
        A teaching engine that understands what you know, what you don't, and why you're stuck.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-sm text-gray-500 max-w-xl mx-auto"
      >
        Select your path below to get started with a personalized experience.
      </motion.p>
    </div>
  );
}
