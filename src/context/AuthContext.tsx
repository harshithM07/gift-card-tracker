'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type AuthUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function parseJsonResponse(
  res: Response
): Promise<Record<string, unknown>> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return {};
  const data: unknown = await res.json();
  if (typeof data === 'object' && data !== null) {
    return data as Record<string, unknown>;
  }
  return {};
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/session', { method: 'GET' });
      const data = await parseJsonResponse(res);
      setUser(res.ok ? ((data.user as AuthUser | undefined) ?? null) : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(
        typeof data.error === 'string' ? data.error : 'Login failed'
      );
    }
    setUser((data.user as AuthUser | undefined) ?? null);
  }

  async function register(email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(
        typeof data.error === 'string' ? data.error : 'Registration failed'
      );
    }
    setUser((data.user as AuthUser | undefined) ?? null);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
