import { Link, Navigate, useParams } from 'react-router-dom';
import { programBySlug } from '@/content/site';
import MarketingShell from '@/components/layout/MarketingShell';
import PageHero from '@/components/marketing/PageHero';
import TryDemoButton from '@/components/auth/TryDemoButton';
import StatStrip from '@/components/marketing/StatStrip';

export default function SubjectDetailPage() {
  const { slug } = useParams();
  const program = programBySlug(slug);

  if (!program) {
    return <Navigate to="/subjects" replace />;
  }

  return (
    <MarketingShell>
      <main>
        <PageHero dark eyebrow={program.kicker} title={program.headline} body={program.blurb}>
          <div className="flex flex-wrap gap-3">
            <TryDemoButton variant="hero" label="Start Learning" />
            <Link
              to="/signup"
              className="hero-outline-btn inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Sign up
            </Link>
          </div>
        </PageHero>
        <StatStrip
          items={[
            { kicker: 'Subject', title: program.subject, body: 'Grade 10 science. One topic at a time.' },
            { kicker: 'In a session', title: 'Socratic questions', body: 'Retrieve a little, then wait for your turn.' },
            { kicker: 'Way in', title: 'Demo or learning home', body: 'Five turns with no account. Notes after Google sign-in.' },
          ]}
        />
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-outfit text-3xl font-semibold">What you will practice</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed">
              {program.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  {bullet}
                </li>
              ))}
            </ul>
            <blockquote className="lab-glass mt-10 rounded-[1.75rem] p-7">
              <p className="text-sm italic leading-relaxed">“{program.quote}”</p>
              <footer className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
                {program.quoteBy}
              </footer>
            </blockquote>
          </div>
          <aside className="lab-glass rounded-[1.75rem] p-7">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-faint)]">
              Starter topics
            </p>
            <ul className="mt-4 space-y-4">
              {program.topics.map((topic) => (
                <li key={topic.title}>
                  <Link to="/demo" className="lab-glass block rounded-2xl p-4 hover:border-[var(--accent)]">
                    <p className="text-sm font-semibold">{topic.title}</p>
                    <p className="mt-1 text-xs text-[var(--ink-muted)]">{topic.subtitle}</p>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/subjects" className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline">
              All subjects
            </Link>
          </aside>
        </section>
      </main>
    </MarketingShell>
  );
}
