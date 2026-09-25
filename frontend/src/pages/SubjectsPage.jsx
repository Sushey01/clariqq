import { Link } from 'react-router-dom';
import MarketingShell from '@/components/layout/MarketingShell';
import PageHero from '@/components/marketing/PageHero';
import ProgramCard from '@/components/marketing/ProgramCard';
import { PROGRAMS } from '@/content/site';
import TryDemoButton from '@/components/auth/TryDemoButton';

export default function SubjectsPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Subjects"
          title="Pick a Grade 10 science track."
          body="Each subject is a program: what you will practice, a starter topic, and a Socratic session you can open without an account."
        >
          <TryDemoButton variant="hero" label="Start Learning" />
        </PageHero>
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-20 text-sm text-[var(--ink-muted)]">
          Looking for a walkthrough instead?{' '}
          <Link to="/how-it-works" className="font-semibold text-[var(--accent)] hover:underline">
            How it works
          </Link>
        </div>
      </main>
    </MarketingShell>
  );
}
