import { Link } from 'react-router-dom';
import MarketingShell from '@/components/layout/MarketingShell';
import PageHero from '@/components/marketing/PageHero';

export default function ForTeachersPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          dark
          eyebrow="For teachers"
          title="A tutor that will not finish the worksheet."
          body="Clariq is built so a student still has to reason. Strict never dumps the answer. Guided hints. Direct explains a little, then checks."
        >
          <Link
            to="/how-it-works"
            className="lab-cta-primary inline-flex rounded-full px-6 py-3 text-sm font-semibold"
          >
            See how a session works
          </Link>
        </PageHero>
        <section className="mx-auto max-w-3xl px-5 py-16 text-base leading-relaxed text-[var(--ink-muted)]">
          <p>
            If a student pastes a homework question, Clariq should not return a complete solution. It
            should retrieve a little from the textbook (or their uploaded notes) and ask the next smaller
            question.
          </p>
          <p className="mt-5">
            That is the whole product. There is no live video classroom and no peer matching. There is a
            Socratic thread, a learning home, and a promise we will not paste the chapter.
          </p>
          <p className="mt-8">
            <Link to="/faq" className="font-semibold text-[var(--accent)] hover:underline">
              Read the FAQ
            </Link>
            {' · '}
            <Link to="/demo" className="font-semibold text-[var(--accent)] hover:underline">
              Try the demo
            </Link>
          </p>
        </section>
      </main>
    </MarketingShell>
  );
}
