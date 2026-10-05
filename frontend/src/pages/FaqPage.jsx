import MarketingShell from '@/components/layout/MarketingShell';
import PageHero from '@/components/marketing/PageHero';
import FaqList from '@/components/learning/FaqList';
import { FAQ_GROUPS } from '@/content/site';

export default function FaqPage() {
  return (
    <MarketingShell>
      <main>
        <PageHero
          eyebrow="Help center"
          title="Advice from the Clariq side of the desk."
          body="Getting started, how the tutor talks, and what happens to your notes."
        />
        <section className="mx-auto max-w-6xl px-5 py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {FAQ_GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="lab-glass rounded-[1.75rem] p-6 hover:border-[var(--accent)]"
              >
                <h2 className="font-outfit text-xl font-semibold">{group.title}</h2>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{group.items.length} questions</p>
              </a>
            ))}
          </div>
        </section>
        {FAQ_GROUPS.map((group) => (
          <section key={group.id} id={group.id} className="mx-auto max-w-6xl scroll-mt-24 px-5 py-10">
            <h2 className="font-outfit text-2xl font-semibold">{group.title}</h2>
            <div className="mt-5">
              <FaqList items={group.items} />
            </div>
          </section>
        ))}
        <div className="h-10" />
      </main>
    </MarketingShell>
  );
}
