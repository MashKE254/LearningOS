'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingLayout } from '@/components/onboarding';
import { ArrowRight, Check, X, Clock, Brain } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  topic: string;
  difficulty: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

// Sample diagnostic questions (in production, these would come from API based on curriculum)
const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'What is the derivative of x²?',
    topic: 'Calculus - Differentiation',
    difficulty: 1,
    options: [
      { id: 'a', text: '2x', isCorrect: true },
      { id: 'b', text: 'x²', isCorrect: false },
      { id: 'c', text: '2', isCorrect: false },
      { id: 'd', text: 'x', isCorrect: false },
    ],
  },
  {
    id: '2',
    text: 'Which of these is the correct expansion of (a + b)²?',
    topic: 'Algebra - Binomial Expansion',
    difficulty: 1,
    options: [
      { id: 'a', text: 'a² + b²', isCorrect: false },
      { id: 'b', text: 'a² + 2ab + b²', isCorrect: true },
      { id: 'c', text: '2a + 2b', isCorrect: false },
      { id: 'd', text: 'a² - b²', isCorrect: false },
    ],
  },
  {
    id: '3',
    text: 'What is the integral of 1/x?',
    topic: 'Calculus - Integration',
    difficulty: 2,
    options: [
      { id: 'a', text: 'x', isCorrect: false },
      { id: 'b', text: 'ln|x| + C', isCorrect: true },
      { id: 'c', text: '-1/x² + C', isCorrect: false },
      { id: 'd', text: 'e^x + C', isCorrect: false },
    ],
  },
  {
    id: '4',
    text: 'Solve for x: 2x + 5 = 13',
    topic: 'Algebra - Linear Equations',
    difficulty: 1,
    options: [
      { id: 'a', text: 'x = 4', isCorrect: true },
      { id: 'b', text: 'x = 9', isCorrect: false },
      { id: 'c', text: 'x = 6', isCorrect: false },
      { id: 'd', text: 'x = 3', isCorrect: false },
    ],
  },
  {
    id: '5',
    text: 'What is the area under the curve y = x² from x = 0 to x = 2?',
    topic: 'Calculus - Definite Integration',
    difficulty: 3,
    options: [
      { id: 'a', text: '4', isCorrect: false },
      { id: 'b', text: '8/3', isCorrect: true },
      { id: 'c', text: '2', isCorrect: false },
      { id: 'd', text: '4/3', isCorrect: false },
    ],
  },
];

export default function CrisisDiagnosticPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { answerId: string; correct: boolean }>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = sampleQuestions[currentIndex];
  const progress = ((currentIndex + (showResult ? 1 : 0)) / sampleQuestions.length) * 100;

  useEffect(() => {
    // Check if we have the required data
    const data = localStorage.getItem('crisis_onboarding');
    if (!data) {
      router.push('/onboarding/crisis');
    }
  }, [router]);

  const handleSelectAnswer = (answerId: string) => {
    if (showResult) return;
    setSelectedAnswer(answerId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = currentQuestion.options.find((o) => o.id === selectedAnswer)?.isCorrect || false;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { answerId: selectedAnswer, correct: isCorrect },
    }));

    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < sampleQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Calculate results and navigate to plan
      const correctCount = Object.values(answers).filter((a) => a.correct).length +
        (currentQuestion.options.find((o) => o.id === selectedAnswer)?.isCorrect ? 1 : 0);
      const totalTime = Math.round((Date.now() - startTime) / 1000);

      const results = {
        correctCount,
        totalQuestions: sampleQuestions.length,
        score: Math.round((correctCount / sampleQuestions.length) * 100),
        timeSeconds: totalTime,
        topicResults: sampleQuestions.reduce((acc, q, i) => {
          const answer = i === currentIndex
            ? { correct: currentQuestion.options.find((o) => o.id === selectedAnswer)?.isCorrect }
            : answers[q.id];
          if (!acc[q.topic]) {
            acc[q.topic] = { correct: 0, total: 0 };
          }
          acc[q.topic].total += 1;
          if (answer?.correct) {
            acc[q.topic].correct += 1;
          }
          return acc;
        }, {} as Record<string, { correct: number; total: number }>),
      };

      localStorage.setItem('crisis_diagnostic_results', JSON.stringify(results));
      router.push('/onboarding/crisis/plan');
    }
  };

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      title="Quick Diagnostic"
      subtitle={`Question ${currentIndex + 1} of ${sampleQuestions.length}`}
      gradient="from-red-500 to-orange-500"
      backHref="/onboarding/crisis"
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Topic Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
          <Brain className="w-4 h-4" />
          {currentQuestion.topic}
        </span>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          {/* Question Text */}
          <h2 className="text-xl font-medium text-gray-900 mb-6">
            {currentQuestion.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const showCorrect = showResult && option.isCorrect;
              const showWrong = showResult && isSelected && !option.isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  disabled={showResult}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50'
                      : showWrong
                      ? 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-violet-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {showCorrect ? (
                      <Check className="w-4 h-4" />
                    ) : showWrong ? (
                      <X className="w-4 h-4" />
                    ) : (
                      option.id.toUpperCase()
                    )}
                  </div>
                  <span
                    className={`flex-1 ${
                      showCorrect
                        ? 'text-green-800'
                        : showWrong
                        ? 'text-red-800'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl ${
                answers[currentQuestion.id]?.correct ||
                currentQuestion.options.find((o) => o.id === selectedAnswer)?.isCorrect
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-orange-50 border border-orange-200'
              }`}
            >
              <div className="font-medium mb-1">
                {answers[currentQuestion.id]?.correct ||
                currentQuestion.options.find((o) => o.id === selectedAnswer)?.isCorrect
                  ? 'Correct!'
                  : 'Not quite right'}
              </div>
              <div className="text-sm text-gray-600">
                {answers[currentQuestion.id]?.correct ||
                currentQuestion.options.find((o) => o.id === selectedAnswer)?.isCorrect
                  ? "Great job! You've got this concept down."
                  : "We'll include this topic in your study plan."}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action Button */}
      <div className="mt-6 flex justify-end">
        {!showResult ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              selectedAnswer
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
          >
            {currentIndex < sampleQuestions.length - 1 ? 'Next Question' : 'See Your Plan'}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </OnboardingLayout>
  );
}
