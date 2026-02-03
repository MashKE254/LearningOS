'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Toaster, ToastProvider } from '@/components/ui/toaster';
import { mockApi, DEMO_USER } from '@/lib/mock-api';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (role: User['role']) => void;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role: 'STUDENT' | 'PARENT' | 'TEACHER';
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// DEVELOPMENT MODE - Auto login enabled
const IS_DEV = true; // Set to false for production

// Dev users for each role - switch easily during development
const DEV_USERS: Record<string, User> = {
  STUDENT: {
    id: 'dev-student-1',
    email: 'student@eduforge.dev',
    name: 'Alex Student',
    role: 'STUDENT',
  },
  PARENT: {
    id: 'dev-parent-1',
    email: 'parent@eduforge.dev',
    name: 'Sarah Parent',
    role: 'PARENT',
  },
  TEACHER: {
    id: 'dev-teacher-1',
    email: 'teacher@eduforge.dev',
    name: 'Mr. Johnson',
    role: 'TEACHER',
  },
  ADMIN: {
    id: 'dev-admin-1',
    email: 'admin@eduforge.dev',
    name: 'Admin User',
    role: 'ADMIN',
  },
};

// Auth Provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(IS_DEV);

  // Auto-login on mount in dev mode
  useEffect(() => {
    if (IS_DEV) {
      // Check localStorage for last used role, default to STUDENT
      const savedRole = localStorage.getItem('dev_role') as User['role'] || 'STUDENT';
      setUser(DEV_USERS[savedRole]);
      setIsDemoMode(true);
      setIsLoading(false);
      console.log(`🚀 DEV MODE: Auto-logged in as ${savedRole}`);
      console.log('💡 Use switchRole() or visit /dev to change roles');
    } else {
      initAuth();
    }
  }, []);

  const initAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Auth init failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (IS_DEV) return;
    await initAuth();
  };

  // Switch role easily in dev mode
  const switchRole = (role: User['role']) => {
    if (DEV_USERS[role]) {
      setUser(DEV_USERS[role]);
      localStorage.setItem('dev_role', role);
      console.log(`🔄 Switched to ${role}`);
    }
  };

  const login = async (email: string, password: string) => {
    if (IS_DEV || isDemoMode) {
      const result = await mockApi.login(email, password);
      if (result.success) {
        setUser(result.data.user as User);
      }
      return;
    }

    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    setUser(data.user);
  };

  const signup = async (data: SignupData) => {
    if (IS_DEV || isDemoMode) {
      const result = await mockApi.signup({ email: data.email, name: data.name, role: data.role });
      if (result.success) {
        setUser(result.data.user as User);
      }
      return;
    }

    const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Signup failed');
    }

    const result = await res.json();
    if (result.token) {
      localStorage.setItem('auth_token', result.token);
    }
    setUser(result.user);
  };

  const logout = async () => {
    if (IS_DEV) {
      // In dev mode, just switch back to student
      setUser(DEV_USERS.STUDENT);
      localStorage.setItem('dev_role', 'STUDENT');
      return;
    }

    await fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isDemoMode,
      login,
      signup,
      logout,
      refreshUser,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Theme Provider (simple dark mode support)
function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Always use dark mode for EduForge
    document.documentElement.classList.add('dark');
  }, []);

  return <>{children}</>;
}

// Main Providers wrapper
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export { AuthContext, DEV_USERS };
