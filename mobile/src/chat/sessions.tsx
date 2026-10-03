import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const KEY = 'clariq_socratic_sessions_v1';

export type ChatMessage = {
  id?: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: number;
  grounded?: boolean;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt?: number;
  messages: ChatMessage[];
  personaId?: string;
  mode?: 'strict' | 'guided' | 'direct';
};

type ChatContextValue = {
  ready: boolean;
  sessions: ChatSession[];
  createChat: (initialTitle?: string, initialQuestion?: string) => string;
  deleteSession: (id: string) => void;
  appendMessage: (sessionId: string, message: ChatMessage, title?: string) => void;
  setSessionMetadata: (sessionId: string, meta: { personaId?: string; mode?: 'strict' | 'guided' | 'direct' }) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function freshSession(initialTitle?: string): ChatSession {
  return {
    id: `session-${Date.now()}`,
    title: initialTitle?.trim() || 'New Socratic inquiry',
    createdAt: Date.now(),
    messages: [],
    mode: 'strict',
    personaId: 'socratic-mentor',
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
      createChat: (initialTitle?: string, initialQuestion?: string) => {
        const session = freshSession(initialTitle);
        if (initialQuestion) {
          session.messages.push({
            id: `msg-${Date.now()}`,
            sender: 'user',
            text: initialQuestion,
            timestamp: Date.now(),
          });
        }
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
            const msgWithMeta: ChatMessage = {
              ...message,
              id: message.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: message.timestamp || Date.now(),
              grounded: message.sender === 'ai' ? true : undefined,
            };
            return {
              ...session,
              title: title ?? session.title,
              updatedAt: Date.now(),
              messages: [...session.messages, msgWithMeta],
            };
          }),
        );
      },
      setSessionMetadata: (sessionId, meta) => {
        update((prev) =>
          prev.map((session) => {
            if (session.id !== sessionId) return session;
            return {
              ...session,
              ...meta,
              updatedAt: Date.now(),
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
