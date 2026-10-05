import { Link } from 'react-router-dom';
import MarketingShell from '@/components/layout/MarketingShell';
import PageHero from '@/components/marketing/PageHero';
import { HOW_STEPS } from '@/content/site';
import TryDemoButton from '@/components/auth/TryDemoButton';
import StudentTurn from '@/components/tutor/StudentTurn';
import SocraticMoveCard from '@/components/tutor/SocraticMoveCard';

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          dark
          eyebrow="How it works"
          title="A session, not a chatbot dump."
          body="All subjects live in the browser. Clariq retrieves a little, asks one question, and waits."
        >
          <TryDemoButton variant="hero" label="Start Learning" />
        </PageHero>
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {HOW_STEPS.map((step) => (
              <div key={step.n} className="lab-glass rounded-[1.75rem] p-8">
                <p className="font-outfit text-sm font-semibold text-[var(--accent)]">{step.n}</p>
                <h2 className="mt-3 font-outfit text-2xl font-semibold">{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="lab-glass mt-12 rounded-[1.75rem] p-5 md:p-10">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-[var(--ink-faint)]">
              A real turn looks like this
            </p>
            <StudentTurn text="What is photosynthesis?" />
            <SocraticMoveCard
              kind="question"
              yourTurn
              text="Before the equation: what do you think a plant needs from its surroundings in order to make its own food?"
            />
          </div>
          <p className="mt-10 text-sm text-[var(--ink-muted)]">
            Want the subject map?{' '}
            <Link to="/subjects" className="font-semibold text-[var(--accent)] hover:underline">
              Browse subjects
            </Link>
          </p>
        </section>
      </main>
    </MarketingShell>
  );
}
