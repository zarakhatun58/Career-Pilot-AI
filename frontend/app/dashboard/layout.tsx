'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { useAuth } from '@/components/auth/auth-provider';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { isLoading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 100);
      setChecked(true);
      return () => clearTimeout(timer);
    }
    setChecked(true);
  }, [isAuthenticated, isLoading, router]);

  if (!checked || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
