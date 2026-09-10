import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import AmbientField from './AmbientField';
import TryDemoButton from './TryDemoButton';
import ThemeToggle from '@/components/theme/ThemeToggle';

export default function AuthLayout({ eyebrow, title, children }) {
  const panel = useRef(null);

  useGSAP(
    () => {
      gsap.from('.brand-copy', {
        x: -24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });
    },
    { scope: panel }
  );

  return (
    <div className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--ink)]">
      <AmbientField />
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      <div
        ref={panel}
        className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2"
      >
        <section className="hidden flex-col justify-between p-12 lg:flex">
          <Link to="/" className="font-outfit text-lg font-semibold tracking-tight">
            Clariq
          </Link>
          <div className="brand-copy max-w-md space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
              Grade 10 science tutor
            </p>
            <h1 className="font-outfit text-4xl font-semibold leading-tight">
              Ask. Think. Arrive at the answer yourself.
            </h1>
            <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
              Clariq guides with Socratic questions instead of dumping solutions.
            </p>
            <div className="pt-2">
              <TryDemoButton />
              <p className="mt-2 text-xs text-[var(--ink-faint)]">
                Short Socratic thread. No account needed.
              </p>
            </div>
          </div>
          <p className="text-xs text-[var(--ink-faint)]">Socratic RAG tutor</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-raised)]/90 p-8 backdrop-blur-md">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--ink-faint)]">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-outfit text-2xl font-semibold">{title}</h2>
            <div className="mt-8">{children}</div>
            <div className="mt-6 flex flex-col items-center gap-2 lg:hidden">
              <TryDemoButton />
              <p className="text-xs text-[var(--ink-faint)]">
                Short Socratic thread. No account needed.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
