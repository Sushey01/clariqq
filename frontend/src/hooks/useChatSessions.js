import { useCallback, useEffect, useRef, useState } from 'react';
import { getSession } from '@/auth/storage';

function getStorageKeys() {
  const sessionUser = getSession();
  const role = sessionUser?.role || 'student';
  const userId = sessionUser?.email || sessionUser?.id || 'guest';
  const safeId = String(userId).toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
  return {
    userId: safeId,
    role,
    KEY: `clariq_socratic_sessions_${role}_${safeId}_v2`,
    LEGACY_KEY_V1: `clariq_socratic_sessions_${role}_${safeId}_v1`,
    LEGACY_KEY_GENERIC: `clariq_socratic_sessions_${role}_${sessionUser?.id || 'guest'}_v1`,
    ACTIVE_KEY: `clariq_active_session_${role}_${safeId}_v2`,
  };
}

function freshSession() {
  return {
    id: `session-${Date.now()}`,
    title: 'New session',
    createdAt: Date.now(),
    messages: [],
  };
}

function loadSavedSessionsForKey(keys) {
  const candidateKeys = [keys.KEY, keys.LEGACY_KEY_V1, keys.LEGACY_KEY_GENERIC];
  for (const k of candidateKeys) {
    if (!k) continue;
    try {
      const saved = localStorage.getItem(k);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function useChatSessions() {
  const initialKeys = getStorageKeys();
  const activeUserIdRef = useRef(initialKeys.userId);

  const [sessions, setSessions] = useState(() => {
    return loadSavedSessionsForKey(initialKeys) || [freshSession()];
  });

  const [activeSessionId, setActiveSessionIdState] = useState(() => {
    try {
      const stored = localStorage.getItem(initialKeys.ACTIVE_KEY);
      if (stored) return stored;
    } catch {
      /* ignore */
    }
    return sessions[0]?.id ?? null;
  });

  // Re-sync sessions whenever logged-in user changes so past sessions are reloaded
  useEffect(() => {
    const currentKeys = getStorageKeys();
    if (currentKeys.userId !== activeUserIdRef.current) {
      activeUserIdRef.current = currentKeys.userId;
      const loaded = loadSavedSessionsForKey(currentKeys);
      if (loaded && loaded.length > 0) {
        setSessions(loaded);
        setActiveSessionIdState(loaded[0].id);
      } else {
        // If logged in user has no stored sessions yet, preserve any ongoing chat
        setSessions((prev) => {
          const hasContent = prev.some((s) => (s.messages || []).length > 0);
          if (hasContent) {
            localStorage.setItem(currentKeys.KEY, JSON.stringify(prev));
            return prev;
          }
          const fresh = [freshSession()];
          setActiveSessionIdState(fresh[0].id);
          return fresh;
        });
      }
    }
  }, [sessions]);

  // Persist sessions whenever sessions state changes
  useEffect(() => {
    const currentKeys = getStorageKeys();
    if (sessions && sessions.length > 0) {
      try {
        localStorage.setItem(currentKeys.KEY, JSON.stringify(sessions));
      } catch {
        /* ignore storage quota errors */
      }
    }
  }, [sessions]);

  const setActiveSessionId = useCallback((id) => {
    setActiveSessionIdState(id);
    const currentKeys = getStorageKeys();
    try {
      localStorage.setItem(currentKeys.ACTIVE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) || sessions[0];

  const createChat = useCallback(() => {
    const session = freshSession();
    setSessions((prev) => {
      const next = [session, ...prev];
      const currentKeys = getStorageKeys();
      try {
        localStorage.setItem(currentKeys.KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setActiveSessionId(session.id);
    return session.id;
  }, [setActiveSessionId]);

  const deleteSession = useCallback(
    (id) => {
      setSessions((prev) => {
        const next = prev.filter((session) => session.id !== id);
        if (next.length === 0) {
          const session = freshSession();
          setActiveSessionId(session.id);
          return [session];
        }
        if (id === activeSessionId) {
          setActiveSessionId(next[0].id);
        }
        return next;
      });
    },
    [activeSessionId, setActiveSessionId]
  );

  const renameSession = useCallback((id, title) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, title } : session
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    const session = freshSession();
    setSessions([session]);
    setActiveSessionId(session.id);
  }, [setActiveSessionId]);

  const appendMessage = useCallback((sessionId, message, title) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          title: title ?? session.title,
          updatedAt: Date.now(),
          messages: [...session.messages, message],
        };
      })
    );
  }, []);

  const replaceMessages = useCallback((sessionId, messages, title) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              messages,
              title: title ?? session.title,
              updatedAt: Date.now(),
            }
          : session
      )
    );
  }, []);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createChat,
    deleteSession,
    renameSession,
    clearAll,
    appendMessage,
    replaceMessages,
  };
}
