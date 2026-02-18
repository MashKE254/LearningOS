'use client';

import { PersonaCard } from './persona-card';
import {
  Clock,
  Users,
  Briefcase,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const personas = [
  {
    id: 'crisis',
    icon: <Clock className="w-7 h-7 text-red-600" />,
    title: "My exam is coming up fast",
    description: "Get a personalized battle plan in 20 minutes. We'll diagnose exactly what you don't know and build a day-by-day study schedule based on past exams.",
    benefits: [
      "Rapid diagnostic assessment",
      "Prioritized study plan",
      "Exam-weighted topics"
    ],
    href: '/onboarding/crisis',
    gradient: 'bg-gradient-to-r from-red-500 to-orange-500',
    iconBg: 'bg-red-50',
  },
  {
    id: 'parent',
    icon: <Users className="w-7 h-7 text-blue-600" />,
    title: "I want to support my child's learning",
    description: "Create profiles for your children, get daily insights, and let us handle the curriculum planning. You facilitate the conversations that matter.",
    benefits: [
      "See specific misconceptions",
      "Daily progress insights",
      "Conversation starters"
    ],
    href: '/onboarding/parent',
    gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'career',
    icon: <Briefcase className="w-7 h-7 text-purple-600" />,
    title: "I'm learning new skills for work",
    description: "Build a portfolio of real projects, get just-in-time teaching, and prepare for interviews—all tailored to your field.",
    benefits: [
      "Project-based learning",
      "Portfolio building",
      "Interview preparation"
    ],
    href: '/onboarding/career',
    gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
    iconBg: 'bg-purple-50',
  },
  {
    id: 'teacher',
    icon: <GraduationCap className="w-7 h-7 text-green-600" />,
    title: "I want tools for my classroom",
    description: "Save hours on planning and differentiation. Get a morning brief, auto-generated IEP reports, and real-time insight into every student.",
    benefits: [
      "Morning brief per class",
      "Real-time student tracking",
      "Auto-generated reports"
    ],
    href: '/onboarding/teacher',
    gradient: 'bg-gradient-to-r from-green-500 to-emerald-500',
    iconBg: 'bg-green-50',
  },
  {
    id: 'student',
    icon: <BookOpen className="w-7 h-7 text-amber-600" />,
    title: "I just want to get better at a subject",
    description: "A personal AI tutor that adapts to your pace and helps you truly understand, not just memorize.",
    benefits: [
      "Socratic teaching method",
      "Personalized pacing",
      "Knowledge tracking"
    ],
    href: '/onboarding/student',
    gradient: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    iconBg: 'bg-amber-50',
  },
];

export function PersonaGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {personas.map((persona, index) => (
        <PersonaCard
          key={persona.id}
          {...persona}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
