import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, MessageCircleQuestion, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import ThemeToggle from '@/components/theme/ThemeToggle';
import TryDemoButton from '@/components/auth/TryDemoButton';

const BEATS = [
  { title: 'Ask', body: 'Bring a Grade 10 science question. Physics, chemistry, biology, or Earth.' },
  { title: 'Think', body: 'Clariq answers with a hint and one question, not a dumped solution.' },
  { title: 'Reply', body: 'You stay in the conversation. Your turn is the point of the tutor.' },
];

export default function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <p className="font-outfit text-lg font-semibold">Clariq</p>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-[var(--ink)] px-3 py-1.5 text-xs font-semibold text-[var(--bg-canvas)]"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 md:pt-16">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Grade 10 science tutor
        </p>
        <h1 className="mt-4 max-w-3xl font-outfit text-4xl font-semibold leading-tight md:text-6xl">
          A Socratic guide, not an answer machine.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--ink-muted)]">
          Clariq asks the next smaller question so you reason it out. Built for students
          who want to understand, not copy homework.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <TryDemoButton />
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium"
          >
            Sign in with Google
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {BEATS.map((beat) => (
            <div
              key={beat.title}
              className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6"
            >
              <p className="font-outfit text-lg font-semibold">{beat.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{beat.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-6 text-sm text-[var(--ink-muted)]">
          <span className="inline-flex items-center gap-2">
            <MessageCircleQuestion className="h-4 w-4 text-[var(--accent)]" />
            One question at a time
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
            I will not dump the full answer
          </span>
          <span className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Strict, guided, or direct
          </span>
        </div>
      </main>
    </div>
  );
}
