import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, FlaskConical, MessageSquare } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useChatSessions } from '@/hooks/useChatSessions';
import { PENDING_PROMPT_KEY } from '@/constants/app';
import { PROGRAMS } from '@/content/site';
import ThemeToggle from '@/components/theme/ThemeToggle';
import MaterialsPanel from '@/components/learning/MaterialsPanel';
import LabFrame from '@/components/lab/LabFrame';
import { Button } from '@/components/ui';

const BENCH_ACCENT = {
  physics: '#22d3ee',
  chemistry: '#fb923c',
  biology: '#4ade80',
  earth: '#7dd3fc',
};

function lastActiveSession(sessions) {
  return [...sessions]
    .filter((session) => (session.messages || []).length > 0)
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))[0];
}

function threadsThisWeek(sessions) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => (session.updatedAt || session.createdAt || 0) >= weekAgo).length;
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
    <LabFrame>
      <header className="lab-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div>
            <Link to="/app" className="font-outfit text-lg font-semibold">
              Clariq
            </Link>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">Lab floor</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="indigo" size="md" className="rounded-full" onClick={() => navigate('/app/chat')}>
              Open the desk
            </Button>
            <Button variant="ghost" size="md" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
          Welcome back{user.name ? ` · ${user.name.split(' ')[0]}` : ''}
        </p>
        <h1 className="mt-2 max-w-2xl font-outfit text-4xl font-semibold leading-tight md:text-5xl">
          Choose a bench. Then take a turn.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">
          This is the lab floor, not a chat list. Pick a science bench or continue the last question path.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { kicker: 'Question paths', title: String(threadCount) },
            { kicker: 'This week', title: String(weekCount) },
            { kicker: 'Last bench', title: last?.title || 'None yet' },
          ].map((stat) => (
            <div key={stat.kicker} className="lab-glass rounded-[1.75rem] p-6">
              <p className="text-xs uppercase tracking-wide text-[var(--ink-faint)]">{stat.kicker}</p>
              <p className="mt-2 truncate font-outfit text-2xl font-semibold">{stat.title}</p>
            </div>
          ))}
        </div>

        {last ? (
          <button
            type="button"
            onClick={() => openChat(last.id)}
            className="lab-glass mt-6 flex w-full items-center justify-between rounded-[1.75rem] px-5 py-4 text-left hover:border-[var(--accent)]"
          >
            <span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
                Continue last path
              </span>
              <span className="mt-1 block text-xs text-[var(--ink-muted)]">{last.title}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-[var(--ink-faint)]" />
          </button>
        ) : null}

        <div className="mt-10">
          <MaterialsPanel />
        </div>

        <section className="mt-14">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--ink-faint)]">
            Choose a bench
          </p>
          <h2 className="mt-2 font-outfit text-3xl font-semibold">Four science stations.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {PROGRAMS.map((program) => (
              <article
                key={program.slug}
                className="lab-glass rounded-[1.75rem] p-7"
                style={{ boxShadow: `inset 0 0 0 1px ${BENCH_ACCENT[program.slug] || '#22d3ee'}22` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: BENCH_ACCENT[program.slug] }}
                >
                  <FlaskConical className="mr-1 inline h-3.5 w-3.5" />
                  Open bench
                </p>
                <h3 className="mt-2 font-outfit text-2xl font-semibold">{program.subject}</h3>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{program.blurb}</p>
                <div className="mt-5 space-y-2">
                  {program.topics.map((topic) => (
                    <button
                      key={topic.title}
                      type="button"
                      onClick={() => startTopic(topic.query)}
                      className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 text-left hover:border-[var(--accent)]"
                    >
                      <span>
                        <span className="block text-sm font-medium">{topic.title}</span>
                        <span className="block text-xs text-[var(--ink-muted)]">{topic.subtitle}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-[var(--ink-faint)]" />
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </LabFrame>
  );
}
