import { Link } from 'react-router-dom';
import LabNav from '@/features/lab/components/LabNav';
import SiteFooter from '@/components/layout/SiteFooter';
import LabHeroFallback from '@/components/lab/LabHeroFallback';
import TryDemoButton from '@/components/auth/TryDemoButton';

export default function AuthLayout({ eyebrow, title, children }) {
  return (
    <div data-lab="cinematic" className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink)]">
      <LabNav />
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl lg:grid-cols-2">
        <section className="hero-band relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
          <span className="lab-orb-cyan pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full" />
          <span className="lab-orb-orange pointer-events-none absolute -right-8 bottom-10 h-64 w-64 rounded-full" />
          <Link to="/" className="relative font-outfit text-lg font-semibold">
            Clariq
          </Link>
          <div className="relative max-w-md space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              Nepal · Class 10 lab
            </p>
            <h1 className="font-outfit text-4xl font-semibold leading-tight">
              Sign in. Pick a bench. Take a turn.
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--hero-muted)' }}>
              After you sign in, your notes can join the textbook. The tutor still waits. The desk stays
              2D and readable.
            </p>
            <TryDemoButton variant="hero" label="Start a question path" />
            <div className="pt-4">
              <LabHeroFallback />
            </div>
          </div>
          <p className="relative text-xs" style={{ color: 'var(--hero-muted)' }}>
            Socratic science lab
          </p>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="lab-glass w-full max-w-md rounded-[1.75rem] p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--ink-faint)]">{eyebrow}</p>
            <h2 className="mt-2 font-outfit text-2xl font-semibold">{title}</h2>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
