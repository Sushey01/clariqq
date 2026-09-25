import { Link } from 'react-router-dom';

export default function ProgramCard({ program }) {
  return (
    <article className="lab-glass flex flex-col rounded-[1.75rem] p-7">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
        {program.kicker}
      </p>
      <h3 className="mt-2 font-outfit text-2xl font-semibold">{program.subject}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{program.blurb}</p>
      <ul className="mt-5 space-y-2 text-sm leading-relaxed">
        {program.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
            {bullet}
          </li>
        ))}
      </ul>
      <p className="mt-6 flex-1 text-sm italic text-[var(--ink-muted)]">“{program.quote}”</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--ink-faint)]">
        {program.quoteBy}
      </p>
      <Link
        to={`/subjects/${program.slug}`}
        className="mt-6 inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        Open this bench
      </Link>
    </article>
  );
}
