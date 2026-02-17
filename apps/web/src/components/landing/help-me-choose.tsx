'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { HelpCircle, X, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: {
    label: string;
    nextQuestion?: string;
    result?: string;
  }[];
}

const questions: Record<string, Question> = {
  start: {
    id: 'start',
    question: "What's your main goal right now?",
    options: [
      { label: "I have an exam or test coming up", nextQuestion: 'exam_timing' },
      { label: "I'm helping my child learn", result: 'parent' },
      { label: "I'm learning for my career", result: 'career' },
      { label: "I teach students", result: 'teacher' },
      { label: "I want to learn something new", result: 'student' },
    ],
  },
  exam_timing: {
    id: 'exam_timing',
    question: "When is your exam?",
    options: [
      { label: "Within the next 2 weeks", result: 'crisis' },
      { label: "Within the next month", result: 'crisis' },
      { label: "More than a month away", result: 'student' },
      { label: "I'm not sure yet", result: 'student' },
    ],
  },
};

const results: Record<string, { title: string; description: string; href: string }> = {
  crisis: {
    title: "Crisis Mode",
    description: "We'll create a battle plan to get you exam-ready fast.",
    href: '/onboarding/crisis',
  },
  parent: {
    title: "Parent Dashboard",
    description: "Track your children's progress and support their learning.",
    href: '/onboarding/parent',
  },
  career: {
    title: "Career Learning",
    description: "Build skills with real projects tailored to your field.",
    href: '/onboarding/career',
  },
  teacher: {
    title: "Teacher Tools",
    description: "Save time with AI-powered classroom management.",
    href: '/onboarding/teacher',
  },
  student: {
    title: "Student Learning",
    description: "Learn at your own pace with a personal AI tutor.",
    href: '/onboarding/student',
  },
};

export function HelpMeChoose() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('start');
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleOptionClick = (option: { nextQuestion?: string; result?: string }) => {
    if (option.result) {
      setResult(option.result);
    } else if (option.nextQuestion) {
      setCurrentQuestion(option.nextQuestion);
    }
  };

  const handleReset = () => {
    setCurrentQuestion('start');
    setResult(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setCurrentQuestion('start');
      setResult(null);
    }, 300);
  };

  const handleGoToResult = () => {
    if (result) {
      router.push(results[result].href);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
      >
        <HelpCircle className="w-4 h-4" />
        Not sure? Help me choose
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  Find your path
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✓</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {results[result].title}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {results[result].description}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Start over
                        </button>
                        <button
                          onClick={handleGoToResult}
                          className="inline-flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {questions[currentQuestion].question}
                      </h3>
                      <div className="space-y-2">
                        {questions[currentQuestion].options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleOptionClick(option)}
                            className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-gray-700 hover:text-gray-900"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
