'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  Shield,
  Globe,
  Zap,
  LineChart
} from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Socratic Teaching",
    description: "Never gives answers directly. Guides you to understanding through questions.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Curriculum-Native",
    description: "Aligned to your exact exam board: CIE, IB, KCSE, AP, CBSE, and more.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Verified Accuracy",
    description: "Math and science answers verified by deterministic engines before you see them.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Multilingual Pedagogy",
    description: "Learn concepts in your language, master terminology in the exam language.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Proactive Intervention",
    description: "The AI notices when you're stuck and offers help—before you have to ask.",
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: "Knowledge Tracking",
    description: "A living map of what you know, what you don't, and what to review next.",
  },
];

export function FeatureShowcase() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Not just another AI chatbot
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            EduForge is a teaching engine that adapts to your curriculum, tracks your understanding,
            and teaches the way great tutors do—through dialogue, not lectures.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl border border-gray-200"
            >
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
