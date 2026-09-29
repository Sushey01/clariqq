import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getAuthMe,
  loginWithEmail as requestEmailLogin,
  loginWithGoogle as requestGoogleLogin,
  signupWithEmail as requestSignup,
  demoLogin as requestDemoLogin,
} from '@/api/client';
import {
  clearAccessToken,
  clearSession,
  getAccessToken,
  getSession,
  publicUser,
  saveAccessToken,
  saveSession,
} from './storage';

const AuthContext = createContext(null);

function applyAuthPayload(data, setUser) {
  saveAccessToken(data.access_token);
  const session = publicUser(data.user);
  saveSession(session);
  setUser(session);
  return session;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return undefined;
    let cancelled = false;
    getAuthMe()
      .then((me) => {
        if (cancelled) return;
        const session = publicUser(me);
        saveSession(session);
        setUser(session);
      })
      .catch(() => {
        if (!cancelled) clearAccessToken();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const signup = async ({ name, email, password }) => {
      const data = await requestSignup({ name, email, password });
      return applyAuthPayload(data, setUser);
    };

    const login = async ({ email, password }) => {
      const data = await requestEmailLogin({ email, password });
      return applyAuthPayload(data, setUser);
    };

    const loginWithGoogle = async (idToken) => {
      const data = await requestGoogleLogin(idToken);
      return applyAuthPayload(data, setUser);
    };

    const loginDemo = async (role) => {
      const data = await requestDemoLogin(role);
      return applyAuthPayload(data, setUser);
    };

    const logout = () => {
      clearAccessToken();
      clearSession();
      setUser(null);
    };

    return { user, signup, login, loginWithGoogle, loginDemo, logout };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
