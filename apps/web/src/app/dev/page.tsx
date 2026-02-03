'use client';

import { useAuth, DEV_USERS } from '@/components/providers';
import { useRouter } from 'next/navigation';

export default function DevPage() {
  const { user, switchRole } = useAuth();
  const router = useRouter();

  const handleRoleSwitch = (role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN') => {
    switchRole(role);
    // Navigate to the appropriate dashboard
    const paths: Record<string, string> = {
      STUDENT: '/student',
      PARENT: '/parent',
      TEACHER: '/teacher',
      ADMIN: '/admin',
    };
    router.push(paths[role]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dev Tools</h1>
        <p className="text-slate-400 mb-8">Quick role switching for development</p>

        <div className="bg-slate-900 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-2">Current User</h2>
          {user ? (
            <div className="text-slate-300">
              <p><span className="text-slate-500">Name:</span> {user.name}</p>
              <p><span className="text-slate-500">Email:</span> {user.email}</p>
              <p><span className="text-slate-500">Role:</span> <span className="text-indigo-400 font-medium">{user.role}</span></p>
            </div>
          ) : (
            <p className="text-slate-500">No user logged in</p>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-4">Switch Role</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(DEV_USERS).map(([role, devUser]) => (
            <button
              key={role}
              onClick={() => handleRoleSwitch(role as 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN')}
              className={`p-4 rounded-xl border transition-all text-left ${
                user?.role === role
                  ? 'bg-indigo-600 border-indigo-500'
                  : 'bg-slate-800 border-slate-700 hover:border-indigo-500'
              }`}
            >
              <div className="font-semibold">{role}</div>
              <div className="text-sm text-slate-400">{devUser.name}</div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-slate-800 rounded-xl">
          <h3 className="font-medium mb-2">Quick Links</h3>
          <div className="flex flex-wrap gap-2">
            <a href="/student" className="px-3 py-1 bg-indigo-600 rounded text-sm hover:bg-indigo-500">Student Dashboard</a>
            <a href="/parent" className="px-3 py-1 bg-purple-600 rounded text-sm hover:bg-purple-500">Parent Dashboard</a>
            <a href="/teacher" className="px-3 py-1 bg-emerald-600 rounded text-sm hover:bg-emerald-500">Teacher Dashboard</a>
            <a href="/admin" className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-500">Admin Dashboard</a>
          </div>
        </div>

        <div className="mt-8 text-slate-500 text-sm">
          <p>Tip: You can also switch roles in the browser console:</p>
          <code className="block mt-2 p-2 bg-slate-900 rounded">
            // Access auth context from React DevTools or use:
            localStorage.setItem('dev_role', 'TEACHER'); location.reload();
          </code>
        </div>
      </div>
    </div>
  );
}
