'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Settings,
  Bell,
  ChevronDown,
  Lightbulb,
  BarChart3,
  FolderOpen,
} from 'lucide-react';

const navItems = [
  { href: '/teacher', icon: LayoutDashboard, label: 'Morning Brief' },
  { href: '/teacher/classroom', icon: BarChart3, label: 'Live Classroom' },
  { href: '/teacher/rooms', icon: FolderOpen, label: 'Student Rooms' },
  { href: '/teacher/needs', icon: Lightbulb, label: 'Learning Needs' },
  { href: '/teacher/materials', icon: BookOpen, label: 'Materials' },
  { href: '/teacher/students', icon: Users, label: 'Students' },
  { href: '/teacher/settings', icon: Settings, label: 'Settings' },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [notifications] = useState(5);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/teacher" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-gray-900">EduForge</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
              Teacher
            </span>
          </Link>
        </div>

        {/* Classroom Selector */}
        <div className="p-4 border-b border-gray-200">
          <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-white text-xs font-medium">
                P3
              </div>
              <span className="text-sm font-medium text-gray-900">
                Period 3 Chemistry
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">T</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Ms. Johnson</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Period 3 Chemistry • 28 students
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Live Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">
                  18 students online
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Quick Actions */}
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                Start Class Session
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
