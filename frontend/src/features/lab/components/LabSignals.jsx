import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { userRole } from '@/auth/roles';

const SIGNALS = [
  {
    title: 'Reasoning trace',
    body: 'Shows how a student reached an idea, not just whether they typed the right line.',
  },
  {
    title: 'Knowledge pulse',
    body: 'Turns repeated gaps into simple signals for revision and support.',
  },
  {
    title: 'Teacher view',
    body: 'Keeps feedback practical, short, and connected to classroom decisions.',
  },
];

export default function LabSignals() {
  const { user } = useAuth();
  const role = userRole(user);
  const progressTo = !user
    ? '/login'
    : role === 'student'
      ? '/app/progress'
      : role === 'teacher'
        ? '/teacher'
        : '/parent';
  return (
    <section id="signals" className="nebular-section" style={{ background: 'var(--n-bg-deep)' }}>
      <div className="nebular-wrap nebular-signals">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--n-cyan)]">
            Adaptive signals
          </p>
          <h2 className="mt-2 font-outfit text-4xl font-semibold leading-tight">
            Progress students and teachers can act on.
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={progressTo} className="nebular-ghost">
              {role === 'parent' ? 'Parent desk' : role === 'teacher' ? 'Teacher desk' : 'Student progress'}
            </Link>
          </div>
        </div>
        {SIGNALS.map((signal) => (
          <article key={signal.title} className="nebular-card p-5">
            <MessageSquare size={18} color="var(--n-cyan)" />
            <h3 className="mt-4 font-outfit text-lg font-semibold">{signal.title}</h3>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--n-muted)' }}>
              {signal.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
