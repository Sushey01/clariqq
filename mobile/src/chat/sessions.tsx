import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const KEY = 'clariq_socratic_sessions_v1';

export type ChatMessage = { sender: 'user' | 'ai'; text: string };

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt?: number;
  messages: ChatMessage[];
};

type ChatContextValue = {
  ready: boolean;
  sessions: ChatSession[];
  createChat: () => string;
  deleteSession: (id: string) => void;
  appendMessage: (sessionId: string, message: ChatMessage, title?: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function freshSession(): ChatSession {
  return {
    id: `session-${Date.now()}`,
    title: 'New session',
    createdAt: Date.now(),
    messages: [],
  };
}

export function ChatSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        const parsed = saved ? (JSON.parse(saved) as ChatSession[]) : [];
        if (!cancelled) {
          setSessions(Array.isArray(parsed) && parsed.length > 0 ? parsed : [freshSession()]);
        }
      } catch {
        if (!cancelled) setSessions([freshSession()]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((fn: (prev: ChatSession[]) => ChatSession[]) => {
    setSessions((prev) => {
      const next = fn(prev);
      void AsyncStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<ChatContextValue>(() => {
    return {
      ready,
      sessions,
      createChat: () => {
        const session = freshSession();
        update((prev) => [session, ...prev]);
        return session.id;
      },
      deleteSession: (id) => {
        update((prev) => {
          const next = prev.filter((session) => session.id !== id);
          return next.length > 0 ? next : [freshSession()];
        });
      },
      appendMessage: (sessionId, message, title) => {
        update((prev) =>
          prev.map((session) => {
            if (session.id !== sessionId) return session;
            return {
              ...session,
              title: title ?? session.title,
              updatedAt: Date.now(),
              messages: [...session.messages, message],
            };
          }),
        );
      },
    };
  }, [ready, sessions, update]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatSessions() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatSessions must be used inside ChatSessionsProvider');
  return context;
}

export function titleFromQuestion(question: string) {
  const trimmed = question.trim();
  return trimmed.length > 32 ? `${trimmed.slice(0, 32)}...` : trimmed;
}
