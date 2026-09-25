import MarketingShell from '@/components/layout/MarketingShell';
import PageHero from '@/components/marketing/PageHero';
import { STORIES } from '@/content/site';
import TryDemoButton from '@/components/auth/TryDemoButton';

export default function StoriesPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Stories"
          title="What a turn actually feels like."
          body="These are process stories — not scoreboard quotes. Clariq is a Socratic tutor, so the proof is that a student had to think."
        >
          <TryDemoButton variant="hero" label="Start Learning" />
        </PageHero>
        <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-2">
          {STORIES.map((story) => (
            <blockquote
              key={story.name}
              className="lab-glass rounded-[1.75rem] p-8"
            >
              <p className="text-base leading-relaxed">“{story.line}”</p>
              <footer className="mt-6 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
                {story.name} · {story.place}
              </footer>
            </blockquote>
          ))}
        </section>
      </main>
    </MarketingShell>
  );
}
