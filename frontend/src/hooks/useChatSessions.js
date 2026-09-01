import { useCallback, useEffect, useState } from 'react';

const KEY = 'clariq_socratic_sessions_v1';

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
  const [activeSessionId, setActiveSessionId] = useState(
    () => sessions[0]?.id ?? null
  );

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(sessions));
  }, [sessions]);

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) || sessions[0];

  const createChat = useCallback(() => {
    const session = freshSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    return session.id;
  }, []);

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
  }, [activeSessionId]);

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
  }, []);

  const appendMessage = useCallback((sessionId, message, title) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          title: title ?? session.title,
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
