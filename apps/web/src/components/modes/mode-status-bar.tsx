'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMode, formatElapsedTime, getAccuracy } from '@/lib/modes';
import {
  Clock,
  Target,
  Zap,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface ModeStatusBarProps {
  className?: string;
  showTimer?: boolean;
  showAccuracy?: boolean;
  showStreak?: boolean;
  showHints?: boolean;
}

export function ModeStatusBar({
  className = '',
  showTimer = true,
  showAccuracy = true,
  showStreak = true,
  showHints = true,
}: ModeStatusBarProps) {
  const { state, config, getElapsedTime } = useMode();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    if (!config.ui.timerVisible && !showTimer) return;

    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [getElapsedTime, config.ui.timerVisible, showTimer]);

  const accuracy = getAccuracy(state);
  const { sessionStats } = state;

  // Calculate streak (consecutive correct answers)
  // This is a simplified version - full implementation would track in state
  const streak = Math.min(sessionStats.questionsCorrect, 5);

  const stats = [
    {
      id: 'timer',
      icon: <Clock className="w-4 h-4" />,
      label: 'Time',
      value: formatElapsedTime(elapsedTime),
      show: (showTimer || config.ui.timerVisible) && elapsedTime > 0,
      color: 'text-gray-600',
    },
    {
      id: 'accuracy',
      icon: <Target className="w-4 h-4" />,
      label: 'Accuracy',
      value: `${Math.round(accuracy)}%`,
      show: showAccuracy && sessionStats.questionsAttempted > 0,
      color:
        accuracy >= 80
          ? 'text-green-600'
          : accuracy >= 50
          ? 'text-amber-600'
          : 'text-red-600',
    },
    {
      id: 'streak',
      icon: <Zap className="w-4 h-4" />,
      label: 'Streak',
      value: `${streak}🔥`,
      show: showStreak && config.ui.showStreaks && streak > 0,
      color: 'text-orange-500',
    },
    {
      id: 'hints',
      icon: <HelpCircle className="w-4 h-4" />,
      label: 'Hints',
      value: sessionStats.hintsUsed.toString(),
      show:
        showHints &&
        config.aiBehavior.hintsEnabled &&
        sessionStats.hintsUsed > 0,
      color: 'text-blue-600',
    },
    {
      id: 'progress',
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Questions',
      value: `${sessionStats.questionsCorrect}/${sessionStats.questionsAttempted}`,
      show: sessionStats.questionsAttempted > 0,
      color: 'text-violet-600',
    },
  ];

  const visibleStats = stats.filter((s) => s.show);

  if (visibleStats.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 ${className}`}
    >
      {visibleStats.map((stat, index) => (
        <div key={stat.id} className="flex items-center gap-2">
          {index > 0 && <div className="w-px h-4 bg-gray-200" />}
          <div className={`flex items-center gap-1.5 ${stat.color}`}>
            {stat.icon}
            <span className="text-sm font-medium">{stat.value}</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
