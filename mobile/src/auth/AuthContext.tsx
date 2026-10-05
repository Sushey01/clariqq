import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  demoLogin as requestDemoLogin,
  getAuthMe,
  loginWithEmail as requestEmailLogin,
  signupWithEmail as requestSignup,
} from '@/api/client';
import type { AuthResponse, AuthUser } from '@/api/types';
import {
  clearAccessToken,
  clearSession,
  loadAccessToken,
  publicUser,
  saveAccessToken,
  saveSession,
} from '@/auth/storage';

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  signup: (input: { name: string; email: string; password: string }) => Promise<AuthUser>;
  login: (input: { email: string; password: string }) => Promise<AuthUser>;
  loginDemo: (role: 'student' | 'teacher' | 'parent') => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function applyAuthPayload(data: AuthResponse) {
  const session = publicUser(data.user);
  await saveAccessToken(data.access_token);
  await saveSession(session);
  return session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await loadAccessToken();
      if (!token) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await getAuthMe();
        const session = publicUser(me);
        await saveSession(session);
        if (!cancelled) setUser(session);
      } catch {
        clearAccessToken();
        await clearSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const adopt = async (data: AuthResponse) => {
      const session = await applyAuthPayload(data);
      setUser(session);
      return session;
    };

    return {
      user,
      ready,
      signup: (input) => requestSignup(input).then(adopt),
      login: (input) => requestEmailLogin(input).then(adopt),
      loginDemo: (role) => requestDemoLogin(role).then(adopt),
      logout: async () => {
        clearAccessToken();
        await clearSession();
        setUser(null);
      },
    };
  }, [ready, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
