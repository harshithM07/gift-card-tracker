'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginRoute = pathname === '/login';

  useEffect(() => {
    if (isLoading) return;

    if (!user && !isLoginRoute) {
      router.replace('/login');
      return;
    }

    if (user && isLoginRoute) {
      router.replace('/');
    }
  }, [isLoading, user, isLoginRoute, router]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-svh flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isLoginRoute) return null;
  if (user && isLoginRoute) return null;

  return <>{children}</>;
}
