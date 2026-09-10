import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutGrid, MessageSquare } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useChatSessions } from '@/hooks/useChatSessions';
import { PENDING_PROMPT_KEY, SOCRATIC_MODES, STARTER_PROMPTS, SUBJECTS } from '@/constants/app';
import ThemeToggle from '@/components/theme/ThemeToggle';
import MaterialsPanel from '@/components/hub/MaterialsPanel';
import { Button, Card } from '@/components/ui';

function lastActiveSession(sessions) {
  return [...sessions]
    .filter((session) => (session.messages || []).length > 0)
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))[0];
}

function threadsThisWeek(sessions) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => (session.updatedAt || session.createdAt || 0) >= weekAgo)
    .length;
}

export default function HubPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sessions, createChat, setActiveSessionId } = useChatSessions();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const last = lastActiveSession(sessions);
  const weekCount = threadsThisWeek(sessions);
  const threadCount = sessions.filter((session) => (session.messages || []).length > 0).length;

  const openChat = (sessionId) => {
    if (sessionId) setActiveSessionId(sessionId);
    navigate('/app/chat');
  };

  const startTopic = (query) => {
    createChat();
    try {
      sessionStorage.setItem(PENDING_PROMPT_KEY, query);
    } catch {
      /* ignore */
    }
    navigate('/app/chat');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-raised)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <Link to="/" className="font-outfit text-lg font-semibold">
              Clariq
            </Link>
            <p className="text-xs text-[var(--ink-muted)]">Student hub</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" size="md" onClick={() => navigate('/app/chat')}>
              Open chat
            </Button>
            <Button variant="ghost" size="md" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-5 py-10">
        <div>
          <h1 className="font-outfit text-3xl font-semibold">
            Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--ink-muted)]">
            Continue a thread or pick a topic. Clariq will not dump the answer.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-faint)]">Threads</p>
            <p className="mt-2 font-outfit text-3xl font-semibold">{threadCount}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-faint)]">This week</p>
            <p className="mt-2 font-outfit text-3xl font-semibold">{weekCount}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-faint)]">Last topic</p>
            <p className="mt-2 truncate font-outfit text-lg font-semibold">
              {last?.title || 'None yet'}
            </p>
          </Card>
        </div>

        {last && (
          <button
            type="button"
            onClick={() => openChat(last.id)}
            className="flex w-full items-center justify-between rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 text-left"
          >
            <span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
                Continue last thread
              </span>
              <span className="mt-1 block text-xs text-[var(--ink-muted)]">{last.title}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-[var(--ink-faint)]" />
          </button>
        )}

        <MaterialsPanel />

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <LayoutGrid className="h-4 w-4" />
            Start from a topic
          </p>
          {SUBJECTS.map((subject) => (
            <div key={subject} className="mb-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
                {subject}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {STARTER_PROMPTS.filter((item) => item.subject === subject).map((item) => (
                  <Card
                    key={item.title}
                    hoverable
                    onClick={() => startTopic(item.query)}
                    className="h-auto text-left"
                  >
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">{item.subtitle}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Teaching style</p>
          <div className="grid gap-2 md:grid-cols-3">
            {SOCRATIC_MODES.map((mode) => (
              <Card key={mode.id} className="p-4">
                <p className="text-sm font-semibold">{mode.title}</p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">{mode.description}</p>
              </Card>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--ink-faint)]">
            Change the style anytime in chat settings.
          </p>
        </div>
      </main>
    </div>
  );
}
