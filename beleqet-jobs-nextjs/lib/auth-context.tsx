'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, User } from './api';

/** Shape of the auth context exposed to consumers. */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: User) => void;
}

/** Registration form data (role defaults to JOB_SEEKER). */
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'JOB_SEEKER' | 'EMPLOYER' | 'FREELANCER';
}

// React context — undefined default forces useAuth to guard access
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Provides auth state (user, loading) and actions (login, register, logout) to the tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  /** Fetch profile from API to validate token and sync user state. */
  const refreshUser = async () => {
    try {
      const userData = await api.getProfile();
      setUser(userData);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /** Authenticate with email/password and set the user state. */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      setUser(response.user);
    } catch (error: any) {
      setIsLoading(false);
      const message = error?.data?.message || error?.message || 'Login failed';
      throw new Error(message);
    }
    setIsLoading(false);
  };

  /** Create a new account and automatically log in. */
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await api.register(data);
      setUser(response.user);
    } catch (error: any) {
      setIsLoading(false);
      const message = error?.data?.message || error?.message || 'Registration failed';
      throw new Error(message);
    }
    setIsLoading(false);
  };

  /** Clear stored tokens and reset user to null. */
  const logout = () => {
    api.logout();
    setUser(null);
  };

  /** Imperatively update the user state (e.g. after profile edit). */
  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to access auth context; throws if used outside AuthProvider. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}