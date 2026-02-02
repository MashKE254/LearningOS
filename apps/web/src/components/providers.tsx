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
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const USE_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Check if backend is available
async function checkBackendAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const res = await fetch(`${API_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

// Auth Provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(USE_DEMO_MODE);

  // Fetch current user on mount
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    // Check if backend is available
    const backendAvailable = await checkBackendAvailable();
    
    if (!backendAvailable) {
      console.log('🎭 Backend not available, using demo mode');
      setIsDemoMode(true);
      
      // Check for stored demo session
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Invalid stored data
        }
      }
      setIsLoading(false);
      return;
    }

    refreshUser();
  };

  const refreshUser = async () => {
    if (isDemoMode) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (isDemoMode) {
      const result = await mockApi.login(email, password);
      if (result.success) {
        setUser(result.data.user as User);
        localStorage.setItem('demo_user', JSON.stringify(result.data.user));
        localStorage.setItem('demo_token', result.data.token);
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
    if (isDemoMode) {
      const result = await mockApi.signup({ email: data.email, name: data.name, role: data.role });
      if (result.success) {
        setUser(result.data.user as User);
        localStorage.setItem('demo_user', JSON.stringify(result.data.user));
        localStorage.setItem('demo_token', result.data.token);
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
    if (isDemoMode) {
      setUser(null);
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_token');
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
    <AuthContext.Provider value={{ user, isLoading, isDemoMode, login, signup, logout, refreshUser }}>
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

export { AuthContext };
