'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OnboardingLayout } from '@/components/onboarding';
import { ArrowRight, Briefcase, Code, LineChart, PenTool, Database, Cloud, Brain, Rocket } from 'lucide-react';

interface CareerGoal {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  skills: string[];
  color: string;
}

const careerGoals: CareerGoal[] = [
  {
    id: 'software',
    icon: <Code className="w-6 h-6" />,
    title: 'Software Development',
    description: 'Build applications and systems',
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'data',
    icon: <Database className="w-6 h-6" />,
    title: 'Data Science & Analytics',
    description: 'Extract insights from data',
    skills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Visualization'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'cloud',
    icon: <Cloud className="w-6 h-6" />,
    title: 'Cloud & DevOps',
    description: 'Build and manage infrastructure',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'ai',
    icon: <Brain className="w-6 h-6" />,
    title: 'AI & Machine Learning',
    description: 'Build intelligent systems',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 'design',
    icon: <PenTool className="w-6 h-6" />,
    title: 'UX/UI Design',
    description: 'Create beautiful experiences',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'product',
    icon: <Rocket className="w-6 h-6" />,
    title: 'Product Management',
    description: 'Lead product strategy',
    skills: ['Roadmapping', 'Analytics', 'User Research', 'Agile', 'Technical Literacy'],
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'business',
    icon: <LineChart className="w-6 h-6" />,
    title: 'Business & Finance',
    description: 'Drive business growth',
    skills: ['Excel', 'Financial Modeling', 'SQL', 'Data Analysis', 'Strategy'],
    color: 'from-emerald-500 to-green-500',
  },
];

const experienceLevels = [
  { id: 'beginner', label: 'Complete Beginner', description: 'New to this field' },
  { id: 'some', label: 'Some Experience', description: '0-2 years in related work' },
  { id: 'switching', label: 'Career Switcher', description: 'Experienced in another field' },
  { id: 'upskilling', label: 'Upskilling', description: 'Already in this field, want to grow' },
];

const weeklyHours = [
  { id: '5', label: '5 hours/week', description: 'Casual learning' },
  { id: '10', label: '10 hours/week', description: 'Steady progress' },
  { id: '20', label: '20 hours/week', description: 'Intensive learning' },
  { id: '40', label: '40+ hours/week', description: 'Full-time commitment' },
];

export default function CareerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [selectedHours, setSelectedHours] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const currentGoal = careerGoals.find((g) => g.id === selectedGoal);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleContinue = () => {
    if (step === 1 && selectedGoal) {
      setStep(2);
    } else if (step === 2 && selectedExperience) {
      setStep(3);
    } else if (step === 3 && selectedHours) {
      // Save and navigate
      localStorage.setItem(
        'career_onboarding',
        JSON.stringify({
          goal: selectedGoal,
          experience: selectedExperience,
          hoursPerWeek: selectedHours,
          focusSkills: selectedSkills,
        })
      );
      router.push('/career');
    }
  };

  const canContinue =
    (step === 1 && selectedGoal) ||
    (step === 2 && selectedExperience) ||
    (step === 3 && selectedHours);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={3}
      title={
        step === 1
          ? 'What career path interests you?'
          : step === 2
          ? 'Where are you starting from?'
          : 'How much time can you commit?'
      }
      subtitle={
        step === 1
          ? "We'll create a personalized learning roadmap to get you job-ready."
          : step === 2
          ? 'This helps us calibrate the right starting point for you.'
          : "We'll build a realistic plan that fits your schedule."
      }
      gradient="from-amber-500 to-orange-500"
    >
      {/* Step 1: Career Goal */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerGoals.map((goal) => {
              const isSelected = selectedGoal === goal.id;
              return (
                <motion.button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-5 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-white ring-2 ring-amber-500 shadow-lg'
                      : 'bg-white border border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {goal.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                      <p className="text-sm text-gray-500">{goal.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {goal.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {goal.skills.length > 3 && (
                          <span className="text-xs px-2 py-0.5 text-gray-400">
                            +{goal.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
                    >
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
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Step 2: Experience Level */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {experienceLevels.map((level) => {
            const isSelected = selectedExperience === level.id;
            return (
              <motion.button
                key={level.id}
                onClick={() => setSelectedExperience(level.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-amber-50 border-2 border-amber-500'
                    : 'bg-white border-2 border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className={`font-medium ${isSelected ? 'text-amber-900' : 'text-gray-900'}`}
                    >
                      {level.label}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-amber-600' : 'text-gray-500'}`}>
                      {level.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
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

          {/* Skills to focus on */}
          {currentGoal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Which skills do you want to focus on? (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {currentGoal.skills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 3: Time Commitment */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {weeklyHours.map((option) => {
            const isSelected = selectedHours === option.id;
            return (
              <motion.button
                key={option.id}
                onClick={() => setSelectedHours(option.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-amber-50 border-2 border-amber-500'
                    : 'bg-white border-2 border-gray-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className={`font-medium ${isSelected ? 'text-amber-900' : 'text-gray-900'}`}
                    >
                      {option.label}
                    </h3>
                    <p className={`text-sm ${isSelected ? 'text-amber-600' : 'text-gray-500'}`}>
                      {option.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-300'
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

          {/* Roadmap Preview */}
          {selectedHours && currentGoal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Your Learning Roadmap</span>
              </div>
              <p className="text-sm text-amber-700">
                At {selectedHours} hours/week, you can expect to be job-ready in{' '}
                <strong>
                  {selectedHours === '5'
                    ? '12-18 months'
                    : selectedHours === '10'
                    ? '6-9 months'
                    : selectedHours === '20'
                    ? '3-5 months'
                    : '2-3 months'}
                </strong>
                . We&apos;ll create a personalized plan with real projects for your portfolio.
              </p>
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
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
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
