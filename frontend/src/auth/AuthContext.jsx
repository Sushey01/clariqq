import { createContext, useContext, useMemo, useState } from 'react';
import {
  clearSession,
  getSession,
  listUsers,
  publicUser,
  saveSession,
  saveUsers,
} from './storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());

  const value = useMemo(() => {
    const signup = ({ name, email, password }) => {
      const normalized = email.trim().toLowerCase();
      const users = listUsers();
      if (users.some((item) => item.email === normalized)) {
        throw new Error('An account with that email already exists.');
      }
      const record = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: normalized,
        password,
      };
      saveUsers([...users, record]);
      const session = publicUser(record);
      saveSession(session);
      setUser(session);
      return session;
    };

    const login = ({ email, password }) => {
      const normalized = email.trim().toLowerCase();
      const match = listUsers().find(
        (item) => item.email === normalized && item.password === password
      );
      if (!match) {
        throw new Error('Email or password is incorrect.');
      }
      const session = publicUser(match);
      saveSession(session);
      setUser(session);
      return session;
    };

    const logout = () => {
      clearSession();
      setUser(null);
    };

    return { user, signup, login, logout };
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
