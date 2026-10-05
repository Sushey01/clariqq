const DEFAULT_STATS = [
  {
    kicker: 'Built for',
    title: 'Grade 10 science',
    body: 'Physics, chemistry, biology, and Earth — one topic at a time.',
  },
  {
    kicker: 'The method',
    title: 'Socratic RAG',
    body: 'Retrieve a little textbook or your notes, then wait for your turn.',
  },
  {
    kicker: 'The promise',
    title: 'Will not dump the answer',
    body: 'Strict, guided, or direct. After a question, you speak.',
  },
];

export default function StatStrip({ items = DEFAULT_STATS }) {
  return (
    <section className="border-y border-[var(--border)]">
      <div className="mx-auto grid max-w-6xl gap-5 px-5 py-10 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="lab-glass rounded-[1.75rem] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-faint)]">
              {item.kicker}
            </p>
            <p className="mt-2 font-outfit text-xl font-semibold">{item.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
