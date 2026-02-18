'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { OnboardingLayout } from '@/components/onboarding';
import { ArrowRight, Plus, Users, Eye, MessageSquare, Bell } from 'lucide-react';

interface ChildProfile {
  id: string;
  name: string;
  age: string;
  grade: string;
  learningNeeds: string[];
}

const learningNeedsOptions = [
  { id: 'adhd', label: 'ADHD', description: 'Shorter sessions, movement breaks' },
  { id: 'dyslexia', label: 'Dyslexia', description: 'Dyslexia-friendly fonts, audio support' },
  { id: 'anxiety', label: 'Test Anxiety', description: 'Encouraging tone, no time pressure' },
  { id: 'gifted', label: 'Advanced Learner', description: 'Accelerated pacing, deeper content' },
  { id: 'ell', label: 'English Learner', description: 'Bilingual support, vocabulary focus' },
  { id: 'autism', label: 'Autism Spectrum', description: 'Predictable patterns, clear instructions' },
];

const gradeOptions = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
];

export default function ParentOnboardingPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [currentChild, setCurrentChild] = useState<Partial<ChildProfile>>({
    id: crypto.randomUUID(),
    name: '',
    age: '',
    grade: '',
    learningNeeds: [],
  });
  const [showForm, setShowForm] = useState(true);

  const handleAddChild = () => {
    if (currentChild.name && currentChild.grade) {
      setChildren([...children, currentChild as ChildProfile]);
      setCurrentChild({
        id: crypto.randomUUID(),
        name: '',
        age: '',
        grade: '',
        learningNeeds: [],
      });
      setShowForm(false);
    }
  };

  const handleAddAnother = () => {
    setShowForm(true);
  };

  const toggleLearningNeed = (needId: string) => {
    setCurrentChild((prev) => ({
      ...prev,
      learningNeeds: prev.learningNeeds?.includes(needId)
        ? prev.learningNeeds.filter((n) => n !== needId)
        : [...(prev.learningNeeds || []), needId],
    }));
  };

  const handleContinue = () => {
    if (children.length > 0) {
      localStorage.setItem('parent_onboarding', JSON.stringify({ children }));
      router.push('/parent');
    }
  };

  return (
    <OnboardingLayout
      step={1}
      totalSteps={2}
      title="Tell us about your children"
      subtitle="We'll create personalized learning paths for each child based on their needs."
      gradient="from-blue-500 to-cyan-500"
    >
      {/* Value Props */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-blue-800 text-sm">See Misconceptions</div>
              <div className="text-xs text-blue-600">Know exactly where they're stuck</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <div className="font-medium text-cyan-800 text-sm">Conversation Starters</div>
              <div className="text-xs text-cyan-600">Help them at the dinner table</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-blue-800 text-sm">Smart Alerts</div>
              <div className="text-xs text-blue-600">Know when they need support</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Added Children */}
      {children.length > 0 && (
        <div className="space-y-3 mb-6">
          {children.map((child) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {child.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{child.name}</div>
                  <div className="text-sm text-gray-500">
                    {child.grade} {child.learningNeeds.length > 0 && `· ${child.learningNeeds.length} accommodations`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChildren(children.filter((c) => c.id !== child.id))}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Child Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <div className="space-y-6">
            {/* Name and Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Name
                </label>
                <input
                  type="text"
                  value={currentChild.name}
                  onChange={(e) => setCurrentChild({ ...currentChild, name: e.target.value })}
                  placeholder="First name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  min="4"
                  max="18"
                  value={currentChild.age}
                  onChange={(e) => setCurrentChild({ ...currentChild, age: e.target.value })}
                  placeholder="Age in years"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                value={currentChild.grade}
                onChange={(e) => setCurrentChild({ ...currentChild, grade: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select grade...</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Learning Needs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any learning considerations? (optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {learningNeedsOptions.map((need) => {
                  const isSelected = currentChild.learningNeeds?.includes(need.id);
                  return (
                    <button
                      key={need.id}
                      type="button"
                      onClick={() => toggleLearningNeed(need.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className={`font-medium text-sm ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                          {need.label}
                        </div>
                        <div className={`text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                          {need.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddChild}
              disabled={!currentChild.name || !currentChild.grade}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                currentChild.name && currentChild.grade
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-5 h-5" />
              Add {currentChild.name || 'Child'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Another / Continue */}
      {children.length > 0 && !showForm && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleAddAnother}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Child
          </button>
        </div>
      )}

      {/* Continue Button */}
      {children.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {children.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Add your children to get started</p>
          <button
            onClick={handleAddAnother}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add a Child
          </button>
        </div>
      )}
    </OnboardingLayout>
  );
}
