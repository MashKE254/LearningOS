'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMode, MODE_CONFIGS } from '@/lib/modes';
import { Lightbulb, X, ArrowRight } from 'lucide-react';

interface ModeSuggestionProps {
  className?: string;
}

export function ModeSuggestion({ className = '' }: ModeSuggestionProps) {
  const { pendingSuggestion, switchMode, dismissSuggestion } = useMode();

  if (!pendingSuggestion) return null;

  const suggestedConfig = MODE_CONFIGS[pendingSuggestion.suggestedMode];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        className={`overflow-hidden ${className}`}
      >
        <div
          className={`bg-gradient-to-r ${suggestedConfig.gradient} rounded-xl p-4 text-white`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium mb-1">
                Switch to {suggestedConfig.name} Mode?
              </h4>
              <p className="text-sm text-white/90">
                {pendingSuggestion.reason}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => switchMode(pendingSuggestion.suggestedMode, 'system_suggestion')}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Switch to {suggestedConfig.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={dismissSuggestion}
                  className="px-4 py-2 text-white/80 hover:text-white text-sm transition-colors"
                >
                  Stay here
                </button>
              </div>
            </div>
            <button
              onClick={dismissSuggestion}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
