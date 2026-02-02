'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type UserRole = 'STUDENT' | 'PARENT' | 'TEACHER';

const roles: { value: UserRole; label: string; description: string; icon: JSX.Element }[] = [
  {
    value: 'STUDENT',
    label: 'Student',
    description: 'I want to learn and improve my grades',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: 'PARENT',
    label: 'Parent',
    description: 'I want to support my child\'s learning',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    value: 'TEACHER',
    label: 'Teacher',
    description: 'I want to enhance my classroom',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    role: '' as UserRole | '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Student-specific
    yearGroup: '',
    nativeLanguage: 'en',
    // Parent-specific
    childrenCount: 1,
    // Teacher-specific
    schoolName: '',
    subject: '',
  });

  const plan = searchParams.get('plan') || 'free';

  const handleRoleSelect = (role: UserRole) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          ...(formData.role === 'STUDENT' && {
            yearGroup: parseInt(formData.yearGroup) || undefined,
            nativeLanguage: formData.nativeLanguage,
          }),
          ...(formData.role === 'TEACHER' && {
            schoolName: formData.schoolName,
            subject: formData.subject,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token and redirect based on role
      localStorage.setItem('token', data.token);
      
      const redirectPath = formData.role === 'STUDENT' ? '/student' 
        : formData.role === 'PARENT' ? '/parent' 
        : '/teacher';
      
      router.push(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-2xl font-bold text-white">EduForge</span>
        </Link>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            1
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-800'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}>
            2
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-white text-center mb-2">Who are you?</h1>
              <p className="text-slate-400 text-center mb-8">Select your role to get started</p>

              <div className="space-y-4">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className="w-full flex items-center gap-4 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl transition text-left group"
                  >
                    <div className="w-12 h-12 bg-indigo-500/20 group-hover:bg-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{role.label}</div>
                      <div className="text-slate-400 text-sm">{role.description}</div>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <h1 className="text-2xl font-bold text-white text-center mb-2">Create your account</h1>
              <p className="text-slate-400 text-center mb-8">
                {formData.role === 'STUDENT' && 'Start your learning journey'}
                {formData.role === 'PARENT' && 'Support your child\'s education'}
                {formData.role === 'TEACHER' && 'Enhance your classroom'}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {/* Role-specific fields */}
                {formData.role === 'STUDENT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Year/Grade
                      </label>
                      <select
                        value={formData.yearGroup}
                        onChange={(e) => setFormData({ ...formData, yearGroup: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      >
                        <option value="">Select your year</option>
                        {[7, 8, 9, 10, 11, 12, 13].map(year => (
                          <option key={year} value={year}>Year {year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Native Language
                      </label>
                      <select
                        value={formData.nativeLanguage}
                        onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="ar">Arabic</option>
                        <option value="sw">Swahili</option>
                        <option value="zh">Chinese</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>
                  </>
                )}

                {formData.role === 'TEACHER' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        School Name
                      </label>
                      <input
                        type="text"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="Springfield High School"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Primary Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      >
                        <option value="">Select subject</option>
                        <option value="mathematics">Mathematics</option>
                        <option value="physics">Physics</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="biology">Biology</option>
                        <option value="english">English</option>
                        <option value="history">History</option>
                        <option value="geography">Geography</option>
                        <option value="computer_science">Computer Science</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {plan !== 'free' && (
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Selected plan:</span>
                      <span className="text-indigo-400 font-medium capitalize">{plan} Plan</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1">
                      You'll be prompted for payment after signup
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </button>

                <p className="text-center text-slate-500 text-sm">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-indigo-400 hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>
                </p>
              </form>
            </>
          )}
        </div>

        {/* Login link */}
        <p className="text-center text-slate-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
