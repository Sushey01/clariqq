import { useCallback, useEffect, useState } from 'react';

const KEY = 'clariq_socratic_sessions_v1';
const ACTIVE_KEY = 'clariq_active_session_v1';

function freshSession() {
  return {
    id: `session-${Date.now()}`,
    title: 'New chat',
    createdAt: Date.now(),
    messages: [],
  };
}

function loadSessions() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return [freshSession()];
}

export function useChatSessions() {
  const [sessions, setSessions] = useState(loadSessions);
  const [activeSessionId, setActiveSessionIdState] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_KEY);
      if (stored) return stored;
    } catch {
      /* ignore */
    }
    return sessions[0]?.id ?? null;
  });

  const setActiveSessionId = useCallback((id) => {
    setActiveSessionIdState(id);
    try {
      localStorage.setItem(ACTIVE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(sessions));
  }, [sessions]);

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) || sessions[0];

  const createChat = useCallback(() => {
    const session = freshSession();
    setSessions((prev) => {
      const next = [session, ...prev];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    setActiveSessionId(session.id);
    return session.id;
  }, [setActiveSessionId]);

  const deleteSession = useCallback((id) => {
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
  }, [activeSessionId, setActiveSessionId]);

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

  const replaceMessages = useCallback((sessionId, messages) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, messages } : session
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
