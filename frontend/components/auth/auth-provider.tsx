'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser, setLoading, logout } from '@/lib/redux/slices/authSlice';
import type { AuthUser } from '@/lib/redux/slices/authSlice';
import { apiFetch } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'careerpilot.auth';

function normalizeUser(value: any, fallback?: Partial<AuthUser>): AuthUser {
  const user = value?.user ?? value;
  return {
    id: String(user?.id ?? fallback?.id ?? 'authenticated-user'),
    email: String(user?.email ?? fallback?.email ?? ''),
    name: String(
      user?.name ??
      user?.full_name ??
      user?.user_metadata?.name ??
      fallback?.name ??
      user?.email?.split('@')[0] ??
      'User'
    ),
    avatarUrl: user?.avatar_url ?? user?.avatarUrl,
  };
}

function saveSession(user: AuthUser, token?: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token: token ?? null }));
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [user, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.user) {
          const restored = normalizeUser(session.user);
          setCurrentUser(restored);
          dispatch(setUser(restored));
        }
      }
    } catch {
      clearSession();
    } finally {
      dispatch(setLoading(false));
      setIsLoading(false);
    }
  }, [dispatch]);

  const applySession = (data: any, fallback?: Partial<AuthUser>) => {
    const nextUser = normalizeUser(data?.user ?? data, fallback);
    const token = data?.access_token ?? data?.accessToken ?? data?.token;
    setCurrentUser(nextUser);
    dispatch(setUser(nextUser));
    saveSession(nextUser, token);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiFetch<any>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      applySession(data, { email });
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unable to sign in.',
      };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
  try {
    const data = await apiFetch<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: name,
      }),
    });

    applySession(data, { email, name });

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error
        ? error.message
        : 'Unable to create account.',
    };
  }
};

  const signOut = async () => {
    clearSession();
    setCurrentUser(null);
    dispatch(logout());
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
