'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OnboardingLayout, CurriculumPicker } from '@/components/onboarding';
import {
  ArrowRight,
  Target,
  Clock,
  Sparkles,
  BookOpen,
  Trophy,
  Zap,
  Moon,
  Sun,
  Coffee,
} from 'lucide-react';

interface StudentProfile {
  curriculum: string;
  subject: string;
  goal: string;
  studyTime: string;
  learningStyle: string[];
}

const learningGoals = [
  {
    id: 'understand',
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Deep Understanding',
    description: 'I want to really understand the concepts, not just memorize',
  },
  {
    id: 'grades',
    icon: <Trophy className="w-5 h-5" />,
    title: 'Improve My Grades',
    description: 'I need to boost my grades this semester',
  },
  {
    id: 'exam',
    icon: <Target className="w-5 h-5" />,
    title: 'Exam Preparation',
    description: 'I have an exam coming up and need to prepare',
  },
  {
    id: 'ahead',
    icon: <Zap className="w-5 h-5" />,
    title: 'Get Ahead',
    description: 'I want to learn topics before they\'re taught in class',
  },
  {
    id: 'curious',
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Pure Curiosity',
    description: 'I just love learning and want to explore',
  },
];

const studyTimes = [
  { id: 'morning', icon: <Sun className="w-5 h-5" />, label: 'Morning', time: '6 AM - 12 PM' },
  { id: 'afternoon', icon: <Coffee className="w-5 h-5" />, label: 'Afternoon', time: '12 PM - 6 PM' },
  { id: 'evening', icon: <Moon className="w-5 h-5" />, label: 'Evening', time: '6 PM - 12 AM' },
  { id: 'flexible', icon: <Clock className="w-5 h-5" />, label: 'Flexible', time: 'Whenever works' },
];

const learningStyles = [
  { id: 'visual', label: 'Visual', description: 'Diagrams, charts, videos' },
  { id: 'reading', label: 'Reading', description: 'Text explanations, examples' },
  { id: 'interactive', label: 'Interactive', description: 'Practice problems, quizzes' },
  { id: 'discussion', label: 'Discussion', description: 'Q&A, dialogue with AI' },
];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<StudentProfile>({
    curriculum: '',
    subject: '',
    goal: '',
    studyTime: '',
    learningStyle: [],
  });

  const handleCurriculumSelect = (curriculum: string, subject: string) => {
    setProfile((prev) => ({
      ...prev,
      curriculum,
      subject,
    }));
  };

  const toggleLearningStyle = (styleId: string) => {
    setProfile((prev) => ({
      ...prev,
      learningStyle: prev.learningStyle.includes(styleId)
        ? prev.learningStyle.filter((s) => s !== styleId)
        : [...prev.learningStyle, styleId],
    }));
  };

  const handleContinue = () => {
    if (step === 1 && profile.curriculum) {
      setStep(2);
    } else if (step === 2 && profile.goal) {
      setStep(3);
    } else if (step === 3 && profile.studyTime) {
      localStorage.setItem('student_onboarding', JSON.stringify(profile));
      router.push('/student');
    }
  };

  const canContinue =
    (step === 1 && profile.curriculum) ||
    (step === 2 && profile.goal) ||
    (step === 3 && profile.studyTime);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={3}
      title={
        step === 1
          ? 'What are you studying?'
          : step === 2
          ? 'What\'s your learning goal?'
          : 'When do you like to study?'
      }
      subtitle={
        step === 1
          ? 'Select your curriculum and subject. We\'ll align everything to your exact syllabus.'
          : step === 2
          ? 'This helps us tailor your learning experience to what matters most to you.'
          : 'We\'ll optimize your study sessions and send reminders at the right time.'
      }
      gradient="from-violet-500 to-purple-500"
    >
      {/* Step 1: Curriculum Selection */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Welcome message */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
              <div>
                <span className="font-medium text-violet-800">Welcome to EduForge!</span>
                <p className="text-sm text-violet-600 mt-1">
                  I&apos;m your AI tutor. I won&apos;t just give you answers—I&apos;ll help you understand
                  concepts deeply through questions and explanations.
                </p>
              </div>
            </div>
          </div>

          <CurriculumPicker
            onSelect={handleCurriculumSelect}
            selectedCurriculum={profile.curriculum}
            selectedSubject={profile.subject}
          />
        </motion.div>
      )}

      {/* Step 2: Learning Goal */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {learningGoals.map((goal) => {
            const isSelected = profile.goal === goal.id;
            return (
              <motion.button
                key={goal.id}
                onClick={() => setProfile({ ...profile, goal: goal.id })}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-violet-50 border-2 border-violet-500'
                    : 'bg-white border-2 border-gray-200 hover:border-violet-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-violet-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {goal.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        isSelected ? 'text-violet-900' : 'text-gray-900'
                      }`}
                    >
                      {goal.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        isSelected ? 'text-violet-600' : 'text-gray-500'
                      }`}
                    >
                      {goal.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
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
              </motion.button>
            );
          })}

          {/* Redirect to crisis mode if exam selected */}
          {profile.goal === 'exam' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4"
            >
              <p className="text-sm text-red-800">
                <strong>Exam coming up soon?</strong> Our{' '}
                <button
                  onClick={() => router.push('/onboarding/crisis')}
                  className="text-red-600 underline hover:text-red-700"
                >
                  Crisis Mode
                </button>{' '}
                creates an intensive study plan to get you exam-ready fast.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 3: Study Time & Style */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Preferred Study Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              When do you prefer to study?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {studyTimes.map((time) => {
                const isSelected = profile.studyTime === time.id;
                return (
                  <button
                    key={time.id}
                    onClick={() => setProfile({ ...profile, studyTime: time.id })}
                    className={`p-4 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-violet-500 text-white'
                        : 'bg-white border-2 border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        isSelected ? 'bg-violet-400' : 'bg-gray-100'
                      }`}
                    >
                      <span className={isSelected ? 'text-white' : 'text-gray-600'}>
                        {time.icon}
                      </span>
                    </div>
                    <div className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {time.label}
                    </div>
                    <div
                      className={`text-xs ${isSelected ? 'text-violet-200' : 'text-gray-500'}`}
                    >
                      {time.time}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Learning Style Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How do you like to learn? (select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {learningStyles.map((style) => {
                const isSelected = profile.learningStyle.includes(style.id);
                return (
                  <button
                    key={style.id}
                    onClick={() => toggleLearningStyle(style.id)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-violet-50 border-2 border-violet-500'
                        : 'bg-white border-2 border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div
                          className={`font-medium ${
                            isSelected ? 'text-violet-900' : 'text-gray-900'
                          }`}
                        >
                          {style.label}
                        </div>
                        <div
                          className={`text-xs ${
                            isSelected ? 'text-violet-600' : 'text-gray-500'
                          }`}
                        >
                          {style.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {profile.studyTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <span className="font-medium text-violet-800">Your personalized path awaits</span>
                  <p className="text-sm text-violet-600 mt-1">
                    We&apos;ll create a learning experience tailored to your {profile.subject} studies,
                    optimized for {studyTimes.find((t) => t.id === profile.studyTime)?.label.toLowerCase()} sessions.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
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
              ? 'bg-violet-600 hover:bg-violet-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step === 3 ? 'Start Learning' : 'Continue'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </OnboardingLayout>
  );
}
