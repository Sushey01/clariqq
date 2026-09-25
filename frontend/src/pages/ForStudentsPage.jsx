import { Link } from 'react-router-dom';
import MarketingShell from '@/components/layout/MarketingShell';
import PageHero from '@/components/marketing/PageHero';
import TryDemoButton from '@/components/auth/TryDemoButton';

export default function ForStudentsPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          dark
          eyebrow="For students"
          title="Stuck on Grade 10 science? Start a session."
          body="Open a demo with no account. Pick physics, chemistry, biology, or Earth. Answer the tutor — do not wait for a dump."
        >
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
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-3">
          {[
            { title: 'Five free turns', body: 'The demo is a real Socratic thread. Sign in when you want to keep going.' },
            { title: 'Your notes later', body: 'Google sign-in unlocks uploads. The tutor can retrieve from your PDF, then still ask.' },
            { title: 'You can be wrong', body: 'A short attempt is better than a copied definition. Clariq will ask smaller, not louder.' },
          ].map((item) => (
            <div key={item.title} className="lab-glass rounded-[1.75rem] p-7">
              <h2 className="font-outfit text-xl font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
            </div>
          ))}
        </section>
      </main>
    </MarketingShell>
  );
}
