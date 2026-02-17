'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMode, LearningMode, MODE_CONFIGS } from '@/lib/modes';
import {
  BookOpen,
  Pencil,
  Clock,
  Bug,
  RotateCcw,
  ChevronDown,
  Check,
  Lock,
} from 'lucide-react';

const modeIcons: Record<LearningMode, React.ReactNode> = {
  LEARN: <BookOpen className="w-4 h-4" />,
  PRACTICE: <Pencil className="w-4 h-4" />,
  EXAM: <Clock className="w-4 h-4" />,
  DEBUG: <Bug className="w-4 h-4" />,
  REVIEW: <RotateCcw className="w-4 h-4" />,
};

interface ModeSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function ModeSwitcher({ className = '', compact = false }: ModeSwitcherProps) {
  const { state, config, switchMode, canSwitchTo } = useMode();
  const [isOpen, setIsOpen] = useState(false);

  const currentMode = state.currentMode;

  const handleModeSelect = (mode: LearningMode) => {
    if (canSwitchTo(mode)) {
      switchMode(mode);
      setIsOpen(false);
    }
  };

  const allModes = Object.keys(MODE_CONFIGS) as LearningMode[];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all bg-gradient-to-r ${config.gradient} text-white hover:opacity-90 ${
          compact ? 'text-sm' : ''
        }`}
      >
        <span className="flex items-center gap-2">
          {modeIcons[currentMode]}
          {!compact && <span className="font-medium">{config.name} Mode</span>}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
            >
              <div className="p-2">
                {allModes.map((mode) => {
                  const modeConfig = MODE_CONFIGS[mode];
                  const isCurrent = mode === currentMode;
                  const isAvailable = canSwitchTo(mode);
                  const isDisabled = !isCurrent && !isAvailable;

                  return (
                    <button
                      key={mode}
                      onClick={() => handleModeSelect(mode)}
                      disabled={isDisabled}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                        isCurrent
                          ? `bg-gradient-to-r ${modeConfig.gradient} text-white`
                          : isAvailable
                          ? 'hover:bg-gray-50'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCurrent
                            ? 'bg-white/20'
                            : `bg-${modeConfig.color}-100 text-${modeConfig.color}-600`
                        }`}
                        style={
                          !isCurrent
                            ? {
                                backgroundColor: `var(--color-${modeConfig.color}-100, #f3f4f6)`,
                                color: `var(--color-${modeConfig.color}-600, #4b5563)`,
                              }
                            : undefined
                        }
                      >
                        {modeIcons[mode]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-medium ${
                              isCurrent ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {modeConfig.name}
                          </span>
                          {isCurrent && <Check className="w-4 h-4" />}
                          {isDisabled && (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isCurrent ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          {modeConfig.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Transition hint */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {currentMode === 'EXAM'
                    ? 'Complete the exam to unlock other modes'
                    : `Switch between modes as you learn. Locked modes become available based on your progress.`}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
