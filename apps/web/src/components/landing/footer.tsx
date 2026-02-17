'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'For Students', href: '/onboarding/student' },
    { label: 'For Parents', href: '/onboarding/parent' },
    { label: 'For Teachers', href: '/onboarding/teacher' },
    { label: 'For Schools', href: '/institutions' },
  ],
  curricula: [
    { label: 'Cambridge (CIE)', href: '/curricula/cie' },
    { label: 'IB Diploma', href: '/curricula/ib' },
    { label: 'KCSE (Kenya)', href: '/curricula/kcse' },
    { label: 'Common Core (US)', href: '/curricula/common-core' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'FERPA Compliance', href: '/compliance/ferpa' },
    { label: 'GDPR Compliance', href: '/compliance/gdpr' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">EduForge</span>
            </div>
            <p className="text-sm">
              Curriculum-native AI teaching infrastructure.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Curricula Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Curricula</h4>
            <ul className="space-y-2">
              {footerLinks.curricula.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} EduForge. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span>Trusted by students in 50+ countries</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
