'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  step?: number;
  totalSteps?: number;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  gradient?: string;
}

export function OnboardingLayout({
  children,
  step,
  totalSteps,
  title,
  subtitle,
  showBack = true,
  backHref = '/',
  gradient = 'from-violet-600 to-purple-600',
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBack && (
                <Link
                  href={backHref}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
              )}
              <Link href="/" className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">EduForge</span>
              </Link>
            </div>

            {/* Progress Indicator */}
            {step && totalSteps && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Step {step} of {totalSteps}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i < step ? `bg-gradient-to-r ${gradient}` : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {title && (
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-600 max-w-lg mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
