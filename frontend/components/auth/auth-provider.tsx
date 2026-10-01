'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser, setLoading, logout } from '@/lib/redux/slices/authSlice';
import type { AuthUser } from '@/lib/redux/slices/authSlice';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: AuthUser = {
  id: 'demo-user',
  email: 'demo@careerpilot.ai',
  name: 'Alex Morgan',
  avatarUrl: '',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      dispatch(setLoading(false));
      setIsLoading(false);
      return;
    }

    dispatch(setLoading(true));

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            name:
              (session.user.user_metadata?.name as string) ||
              session.user.email?.split('@')[0] ||
              'User',
            avatarUrl: session.user.user_metadata?.avatar_url as string | undefined,
          };
          dispatch(setUser(authUser));
        } else if (event === 'SIGNED_OUT') {
          dispatch(logout());
        }
        setIsLoading(false);
      })();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const authUser: AuthUser = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name:
            (data.session.user.user_metadata?.name as string) ||
            data.session.user.email?.split('@')[0] ||
            'User',
          avatarUrl: data.session.user.user_metadata?.avatar_url as string | undefined,
        };
        dispatch(setUser(authUser));
      }
      setIsLoading(false);
    });
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      dispatch(setUser(DEMO_USER));
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      dispatch(setUser({ ...DEMO_USER, email, name }));
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      dispatch(logout());
      return;
    }
    await supabase.auth.signOut();
    dispatch(logout());
  };

  return (
    <AuthContext.Provider value={{ user: null, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
