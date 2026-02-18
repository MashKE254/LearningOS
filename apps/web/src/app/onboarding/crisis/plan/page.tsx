'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OnboardingLayout } from '@/components/onboarding';
import {
  ArrowRight,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Book,
  Brain,
} from 'lucide-react';

interface TopicResult {
  correct: number;
  total: number;
}

interface DiagnosticResults {
  correctCount: number;
  totalQuestions: number;
  score: number;
  timeSeconds: number;
  topicResults: Record<string, TopicResult>;
}

interface OnboardingData {
  board: string;
  subject: string;
  subjectName: string;
  examDate: string;
  daysUntil: number;
}

interface PlanDay {
  day: number;
  date: string;
  focus: string;
  tasks: { type: string; description: string; duration: string }[];
  priority: 'high' | 'medium' | 'low';
}

export default function CrisisPlanPage() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResults | null>(null);
  const [plan, setPlan] = useState<PlanDay[]>([]);

  useEffect(() => {
    const storedOnboarding = localStorage.getItem('crisis_onboarding');
    const storedResults = localStorage.getItem('crisis_diagnostic_results');

    if (!storedOnboarding || !storedResults) {
      router.push('/onboarding/crisis');
      return;
    }

    const onboarding = JSON.parse(storedOnboarding) as OnboardingData;
    const results = JSON.parse(storedResults) as DiagnosticResults;

    setOnboardingData(onboarding);
    setDiagnosticResults(results);

    // Generate plan based on results
    const generatedPlan = generatePlan(onboarding, results);
    setPlan(generatedPlan);
  }, [router]);

  const generatePlan = (data: OnboardingData, results: DiagnosticResults): PlanDay[] => {
    const days = Math.min(data.daysUntil, 14); // Max 14 days of plan
    const weakTopics = Object.entries(results.topicResults)
      .filter(([_, r]) => r.correct / r.total < 0.7)
      .map(([topic]) => topic);

    const plan: PlanDay[] = [];
    const startDate = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const isLastDays = days - i <= 2;
      const isFirstDays = i < 2;

      plan.push({
        day: i + 1,
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        focus: isFirstDays
          ? weakTopics[i % weakTopics.length] || 'Core Concepts Review'
          : isLastDays
          ? 'Final Review & Practice'
          : weakTopics[i % weakTopics.length] || 'Topic Practice',
        tasks: [
          {
            type: 'review',
            description: isFirstDays
              ? `Review key concepts in ${weakTopics[0] || 'identified weak areas'}`
              : isLastDays
              ? 'Quick concept refresher'
              : 'Focused topic study',
            duration: '30 min',
          },
          {
            type: 'practice',
            description: isLastDays
              ? 'Past paper practice under exam conditions'
              : 'Practice problems with instant feedback',
            duration: '45 min',
          },
          {
            type: 'assessment',
            description: isLastDays
              ? 'Self-assessment and confidence check'
              : 'Quick mastery check',
            duration: '15 min',
          },
        ],
        priority: isLastDays ? 'high' : isFirstDays ? 'high' : 'medium',
      });
    }

    return plan;
  };

  const handleStartLearning = () => {
    // In production, this would create the user account and study plan
    router.push('/student');
  };

  if (!onboardingData || !diagnosticResults) {
    return (
      <OnboardingLayout gradient="from-red-500 to-orange-500">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </OnboardingLayout>
    );
  }

  const weakTopics = Object.entries(diagnosticResults.topicResults)
    .filter(([_, r]) => r.correct / r.total < 0.7)
    .map(([topic]) => topic);

  const strongTopics = Object.entries(diagnosticResults.topicResults)
    .filter(([_, r]) => r.correct / r.total >= 0.7)
    .map(([topic]) => topic);

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title="Your Battle Plan is Ready"
      subtitle={`${onboardingData.daysUntil} days until your ${onboardingData.subjectName} exam`}
      gradient="from-red-500 to-orange-500"
      backHref="/onboarding/crisis/diagnostic"
    >
      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6 text-center"
        >
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {diagnosticResults.score}%
          </div>
          <div className="text-gray-500 text-sm">Diagnostic Score</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6 text-center"
        >
          <div className="text-4xl font-bold text-orange-600 mb-1">
            {weakTopics.length}
          </div>
          <div className="text-gray-500 text-sm">Topics to Focus On</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6 text-center"
        >
          <div className="text-4xl font-bold text-red-600 mb-1">
            {onboardingData.daysUntil}
          </div>
          <div className="text-gray-500 text-sm">Days Until Exam</div>
        </motion.div>
      </div>

      {/* Topic Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-500" />
          Topic Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weak Topics */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="font-medium text-red-800">Needs Focus</span>
            </div>
            <ul className="space-y-2">
              {weakTopics.length > 0 ? (
                weakTopics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2 text-sm text-red-700">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {topic}
                  </li>
                ))
              ) : (
                <li className="text-sm text-red-600">Great job! No major weak areas found.</li>
              )}
            </ul>
          </div>

          {/* Strong Topics */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Looking Good</span>
            </div>
            <ul className="space-y-2">
              {strongTopics.length > 0 ? (
                strongTopics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2 text-sm text-green-700">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    {topic}
                  </li>
                ))
              ) : (
                <li className="text-sm text-green-600">Keep practicing to build confidence!</li>
              )}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Day-by-Day Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-200 p-6 mb-8"
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Your Day-by-Day Plan
        </h3>

        <div className="space-y-3">
          {plan.slice(0, 5).map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`flex items-start gap-4 p-4 rounded-lg ${
                day.priority === 'high' ? 'bg-orange-50' : 'bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">Day {day.day}</div>
                <div className="text-xs text-gray-500">{day.date}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 mb-2">{day.focus}</div>
                <div className="flex flex-wrap gap-2">
                  {day.tasks.map((task, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-gray-600 border border-gray-200"
                    >
                      {task.type === 'review' && <Book className="w-3 h-3" />}
                      {task.type === 'practice' && <Brain className="w-3 h-3" />}
                      {task.type === 'assessment' && <Target className="w-3 h-3" />}
                      {task.duration}
                    </span>
                  ))}
                </div>
              </div>
              {day.priority === 'high' && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                  Priority
                </span>
              )}
            </motion.div>
          ))}

          {plan.length > 5 && (
            <div className="text-center text-gray-500 text-sm py-2">
              + {plan.length - 5} more days in your complete plan
            </div>
          )}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-center"
      >
        <h3 className="text-xl font-bold text-white mb-2">Ready to crush your exam?</h3>
        <p className="text-red-100 mb-4">
          Start your personalized study plan now. No credit card required.
        </p>
        <button
          onClick={handleStartLearning}
          className="inline-flex items-center gap-2 px-8 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          Start Learning
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </OnboardingLayout>
  );
}
