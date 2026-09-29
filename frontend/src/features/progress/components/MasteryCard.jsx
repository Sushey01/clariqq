import { masteryTone } from '@/features/progress/lib/mastery';

export default function MasteryCard({ node }) {
  const color = masteryTone(node.m, node.confused);
  const unseen = node.seen === false;
  return (
    <article
      className="rounded-2xl border px-4 py-3"
      style={{
        borderColor: `${color}55`,
        background: 'rgba(8, 28, 36, 0.55)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-outfit text-sm font-semibold">{node.name}</p>
        <span className="text-[11px] tabular-nums" style={{ color }}>
          {unseen ? 'unseen' : Number(node.m ?? 0).toFixed(2)}
        </span>
      </div>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-[var(--ink-faint)]">
        {node.subject}
        {node.chapter ? ` · ${node.chapter}` : ''}
      </p>
      {node.confused ? (
        <p className="mt-2 text-xs text-rose-300">Confused — three low-st turns</p>
      ) : null}
    </article>
  );
}
