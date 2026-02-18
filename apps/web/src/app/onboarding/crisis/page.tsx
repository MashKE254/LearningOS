'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OnboardingLayout, CurriculumPicker, ExamDatePicker } from '@/components/onboarding';
import { ArrowRight, Clock, Target, Zap } from 'lucide-react';

type Step = 'subject' | 'date';

export default function CrisisOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('subject');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [examDate, setExamDate] = useState<Date | null>(null);
  const [daysUntil, setDaysUntil] = useState<number | null>(null);

  const handleSubjectSelect = (board: any, subject: any) => {
    setSelectedBoard(board.id);
    setSelectedSubject(subject.id);
    setSubjectName(subject.name);
  };

  const handleDateSelect = (date: Date, days: number) => {
    setExamDate(date);
    setDaysUntil(days);
  };

  const handleContinue = () => {
    if (step === 'subject' && selectedSubject) {
      setStep('date');
    } else if (step === 'date' && examDate) {
      // Store data and navigate to diagnostic
      localStorage.setItem('crisis_onboarding', JSON.stringify({
        board: selectedBoard,
        subject: selectedSubject,
        subjectName,
        examDate: examDate.toISOString(),
        daysUntil,
      }));
      router.push('/onboarding/crisis/diagnostic');
    }
  };

  const canContinue = step === 'subject' ? selectedSubject : examDate;

  return (
    <OnboardingLayout
      step={step === 'subject' ? 1 : 2}
      totalSteps={3}
      title={step === 'subject' ? "What subject is your exam in?" : "When is your exam?"}
      subtitle={
        step === 'subject'
          ? "We'll tailor everything to your specific curriculum and exam board."
          : "We'll create a day-by-day battle plan based on the time you have."
      }
      gradient="from-red-500 to-orange-500"
    >
      {/* Crisis Mode Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="font-medium text-red-800">Crisis Mode Activated</div>
            <div className="text-sm text-red-600">
              We'll get you exam-ready with a personalized rapid-review plan.
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {step === 'subject' ? (
          <CurriculumPicker
            onSelect={handleSubjectSelect}
            selectedExamBoard={selectedBoard}
            selectedSubject={selectedSubject}
          />
        ) : (
          <ExamDatePicker onSelect={handleDateSelect} selectedDate={examDate || undefined} />
        )}
      </div>

      {/* Continue Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            canContinue
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step === 'date' ? 'Start Diagnostic' : 'Continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* What happens next */}
      {step === 'date' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 bg-gray-50 rounded-xl p-6"
        >
          <h3 className="font-medium text-gray-900 mb-4">What happens next:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Quick Diagnostic</div>
                <div className="text-sm text-gray-500">
                  5-10 questions to pinpoint exactly what you need to review
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Battle Plan</div>
                <div className="text-sm text-gray-500">
                  A day-by-day schedule weighted by exam topics and your gaps
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Intensive Practice</div>
                <div className="text-sm text-gray-500">
                  Past paper questions with mark scheme feedback
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </OnboardingLayout>
  );
}
