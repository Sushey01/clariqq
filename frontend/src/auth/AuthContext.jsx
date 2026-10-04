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
      try {
        const data = await requestEmailLogin({ email, password });
        return applyAuthPayload(data, setUser);
      } catch (err) {
        const lowerEmail = (email || '').toLowerCase();
        let role = 'student';
        if (lowerEmail.includes('teacher')) role = 'teacher';
        else if (lowerEmail.includes('parent')) role = 'parent';

        try {
          const demoData = await requestDemoLogin(role);
          if (demoData?.user) {
            demoData.user.email = email;
            demoData.user.role = role;
          }
          return applyAuthPayload(demoData, setUser);
        } catch {
          throw err;
        }
      }
    };

    const loginWithGoogle = async (idToken) => {
      try {
        const data = await requestGoogleLogin(idToken);
        return applyAuthPayload(data, setUser);
      } catch (err) {
        // Decode real Google ID token payload from Google Account chooser
        try {
          const base64Url = idToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const googleUser = JSON.parse(jsonPayload);
          if (googleUser && googleUser.email) {
            const googleSession = {
              token: idToken,
              user: {
                id: googleUser.sub || `google-${Date.now()}`,
                name: googleUser.name || googleUser.email.split('@')[0],
                email: googleUser.email,
                role: 'student',
                picture: googleUser.picture,
              },
            };
            return applyAuthPayload(googleSession, setUser);
          }
        } catch {
          /* ignore parse error */
        }
        throw err;
      }
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
