'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface PersonaCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  benefits: string[];
  href: string;
  gradient: string;
  iconBg: string;
  delay?: number;
}

export function PersonaCard({
  icon,
  title,
  description,
  benefits,
  href,
  gradient,
  iconBg,
  delay = 0,
}: PersonaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative"
    >
      <Link href={href}>
        <div className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-gray-300`}>
          {/* Gradient accent */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`} />

          {/* Icon */}
          <div className={`w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>

          {/* Content */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
            {title}
          </h3>

          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {description}
          </p>

          {/* Benefits */}
          <ul className="space-y-2 mb-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-500">
                <span className="text-green-500 mt-0.5">✓</span>
                {benefit}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
            Get started
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
