'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OnboardingLayout, CurriculumPicker } from '@/components/onboarding';
import {
  ArrowRight,
  Users,
  BookOpen,
  Brain,
  Clock,
  Lightbulb,
  Shield,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

interface ClassroomSetup {
  name: string;
  subject: string;
  curriculum: string;
  gradeLevel: string;
  studentCount: string;
}

const gradeLevels = [
  'Elementary (K-5)',
  'Middle School (6-8)',
  'High School (9-12)',
  'Higher Education',
  'Professional/Adult',
];

const teacherFeatures = [
  {
    id: 'student_rooms',
    icon: <Users className="w-5 h-5" />,
    title: 'Student Rooms',
    description: 'Create AI-powered learning spaces for groups or individuals with guardrails you control',
  },
  {
    id: 'needs_board',
    icon: <Lightbulb className="w-5 h-5" />,
    title: 'Learning Needs Board',
    description: 'Students anonymously share what they\'re struggling with. You see patterns instantly',
  },
  {
    id: 'live_view',
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Classroom Live View',
    description: 'Real-time dashboard showing who\'s stuck, who\'s progressing, who needs help',
  },
  {
    id: 'morning_brief',
    icon: <Clock className="w-5 h-5" />,
    title: 'Morning Brief',
    description: 'Daily summary: who completed what, common misconceptions, suggested focus areas',
  },
  {
    id: 'socratic_mode',
    icon: <Brain className="w-5 h-5" />,
    title: 'Socratic Mode Control',
    description: 'Set how much the AI guides vs. challenges students based on your pedagogy',
  },
  {
    id: 'safety',
    icon: <Shield className="w-5 h-5" />,
    title: 'Safety Controls',
    description: 'Age-appropriate content filtering and conversation monitoring',
  },
];

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [classroom, setClassroom] = useState<ClassroomSetup>({
    name: '',
    subject: '',
    curriculum: '',
    gradeLevel: '',
    studentCount: '',
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'student_rooms',
    'needs_board',
    'live_view',
  ]);

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((f) => f !== featureId)
        : [...prev, featureId]
    );
  };

  const handleCurriculumSelect = (curriculum: string, subject: string) => {
    setClassroom((prev) => ({
      ...prev,
      curriculum,
      subject,
    }));
  };

  const handleContinue = () => {
    if (step === 1 && classroom.name && classroom.gradeLevel) {
      setStep(2);
    } else if (step === 2 && classroom.curriculum) {
      setStep(3);
    } else if (step === 3) {
      localStorage.setItem(
        'teacher_onboarding',
        JSON.stringify({
          classroom,
          enabledFeatures: selectedFeatures,
        })
      );
      router.push('/teacher');
    }
  };

  const canContinue =
    (step === 1 && classroom.name && classroom.gradeLevel) ||
    (step === 2 && classroom.curriculum) ||
    step === 3;

  return (
    <OnboardingLayout
      step={step}
      totalSteps={3}
      title={
        step === 1
          ? 'Set up your first classroom'
          : step === 2
          ? 'Choose your curriculum'
          : 'Customize your teaching tools'
      }
      subtitle={
        step === 1
          ? "We'll help you create an AI-powered learning environment for your students."
          : step === 2
          ? 'Select the curriculum and subject you teach so AI stays aligned with your standards.'
          : 'Enable the features that fit your teaching style.'
      }
      gradient="from-emerald-500 to-teal-500"
    >
      {/* Step 1: Basic Classroom Setup */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Value Props */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-800">Save 10+ hours/week</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-800">See every student&apos;s thinking</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-800">AI that teaches, not tells</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            {/* Classroom Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classroom Name
              </label>
              <input
                type="text"
                value={classroom.name}
                onChange={(e) => setClassroom({ ...classroom, name: e.target.value })}
                placeholder="e.g., Period 3 Chemistry, Ms. Johnson's Math"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Grade Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {gradeLevels.map((grade) => {
                  const isSelected = classroom.gradeLevel === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setClassroom({ ...classroom, gradeLevel: grade })}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Approximate Student Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approximate Class Size
              </label>
              <select
                value={classroom.studentCount}
                onChange={(e) => setClassroom({ ...classroom, studentCount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select class size...</option>
                <option value="1-10">1-10 students</option>
                <option value="11-20">11-20 students</option>
                <option value="21-30">21-30 students</option>
                <option value="31-40">31-40 students</option>
                <option value="40+">40+ students</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Curriculum Selection */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CurriculumPicker
            onSelect={handleCurriculumSelect}
            selectedCurriculum={classroom.curriculum}
            selectedSubject={classroom.subject}
          />
        </motion.div>
      )}

      {/* Step 3: Feature Selection */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-600 mb-4">
            All features are included in your plan. Enable what you want to use:
          </p>

          <div className="space-y-3">
            {teacherFeatures.map((feature) => {
              const isSelected = selectedFeatures.includes(feature.id);
              return (
                <motion.button
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-2 border-emerald-500'
                      : 'bg-white border-2 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-medium ${
                            isSelected ? 'text-emerald-900' : 'text-gray-900'
                          }`}
                        >
                          {feature.title}
                        </h3>
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          isSelected ? 'text-emerald-600' : 'text-gray-500'
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-medium text-emerald-800">Ready to transform your classroom</span>
                <p className="text-sm text-emerald-600 mt-1">
                  {classroom.name} • {classroom.gradeLevel} • {classroom.subject}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            canContinue
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step === 3 ? 'Go to Dashboard' : 'Continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
