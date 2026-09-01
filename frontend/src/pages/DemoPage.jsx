import { useCallback, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { sendChat } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import ChatView from '@/components/chat/ChatView';
import DemoLimitCard from '@/components/chat/DemoLimitCard';

const DEMO_SESSION_ID = 'demo-guest';

export default function DemoPage() {
  const { user } = useAuth();
  const health = useBackendHealth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const asked = messages.some((message) => message.sender === 'user');
  const locked = asked;

  const session = useMemo(
    () => ({ id: DEMO_SESSION_ID, title: 'Demo', messages }),
    [messages]
  );

  const ask = useCallback(
    async (question) => {
      if (!question.trim() || asked) return;
      setMessages((prev) => [...prev, { sender: 'user', text: question }]);
      setIsLoading(true);
      try {
        const data = await sendChat({
          question,
          sessionId: DEMO_SESSION_ID,
          socraticMode: 'strict',
        });
        setMessages((prev) => [...prev, { sender: 'ai', text: data.answer }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: `Could not reach the Clariq API. ${error.message}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [asked]
  );

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#212121] text-zinc-100">
      <header className="flex h-14 items-center justify-between px-4">
        <p className="text-sm font-medium text-zinc-300">
          Demo · one free question
        </p>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-zinc-400 hover:text-white">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black"
          >
            Sign up
          </Link>
        </div>
      </header>
      <ChatView
        session={session}
        isLoading={isLoading}
        socraticMode="strict"
        backendStatus={health.status}
        onSend={ask}
        composerDisabled={locked}
        composerPlaceholder={
          locked
            ? 'Sign up to ask another question'
            : 'Ask one Grade 10 science question'
        }
        footer={locked && !isLoading ? <DemoLimitCard /> : null}
      />
    </div>
  );
}
