import { useCallback, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { sendChat } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import ChatView from '@/components/chat/ChatView';
import DemoLimitCard from '@/components/chat/DemoLimitCard';
import SiteHeader from '@/components/layout/SiteHeader';
import LabFrame from '@/components/lab/LabFrame';

const DEMO_MAX_TURNS = 5;

function freshDemoSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `demo-${crypto.randomUUID()}`;
  }
  return `demo-${Date.now()}`;
}

export default function DemoPage() {
  const { user } = useAuth();
  const health = useBackendHealth();
  const [sessionId] = useState(freshDemoSessionId);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const studentTurns = messages.filter((message) => message.sender === 'user').length;
  const locked = studentTurns >= DEMO_MAX_TURNS;

  const session = useMemo(
    () => ({ id: sessionId, title: 'Demo', messages }),
    [sessionId, messages]
  );

  const ask = useCallback(
    async (question) => {
      if (!question.trim() || locked) return;
      setMessages((prev) => [...prev, { sender: 'user', text: question }]);
      setIsLoading(true);
      try {
        const data = await sendChat({
          question,
          sessionId,
          socraticMode: 'strict',
        });
        setMessages((prev) => [...prev, { sender: 'ai', text: data.answer }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: error.message },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [locked, sessionId]
  );

  if (user) {
    return <Navigate to="/app" replace />;
  }

  const remaining = DEMO_MAX_TURNS - studentTurns;

  return (
    <LabFrame className="h-screen">
      <SiteHeader />
      <p className="lab-header border-b border-[var(--border)] px-5 py-2 text-center text-xs text-[var(--ink-muted)]">
        Open desk · five student turns
        {studentTurns > 0 && !locked
          ? ` · ${remaining} ${remaining === 1 ? 'reply' : 'replies'} left`
          : ''}
      </p>
      <ChatView
        session={session}
        isLoading={isLoading}
        socraticMode="strict"
        backendStatus={health.status}
        onSend={ask}
        composerDisabled={locked}
        composerPlaceholder={
          locked
            ? 'Sign up to keep going'
            : studentTurns === 0
              ? 'Ask a Grade 10 science question'
              : 'Answer the tutor, then send'
        }
        footer={locked && !isLoading ? <DemoLimitCard /> : null}
      />
    </LabFrame>
  );
}
