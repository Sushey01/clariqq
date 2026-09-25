import { STARTER_PROMPTS, SUBJECT_COPY, SUBJECTS } from '@/constants/app';
import TopicCard from '@/components/learning/TopicCard';

const ACCENT = {
  Physics: '#22d3ee',
  Chemistry: '#fb923c',
  Biology: '#4ade80',
  Earth: '#7dd3fc',
};

export default function EmptyState({ onPrompt }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-8 pt-8">
      <p className="text-center text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
        The desk
      </p>
      <h1 className="mt-2 text-center font-outfit text-[28px] font-semibold tracking-tight md:text-4xl">
        What are we working on?
      </h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-[var(--ink-muted)]">
        A 2D question path. No WebGL here — just one smaller question, then your turn.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {SUBJECTS.map((subject) => (
          <div key={subject} className="lab-glass rounded-[1.75rem] p-5 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: ACCENT[subject] }}>
              {subject} bench
            </p>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">{SUBJECT_COPY[subject]}</p>
            <div className="mt-3 grid gap-2">
              {STARTER_PROMPTS.filter((card) => card.subject === subject).map((card) => (
                <TopicCard
                  key={card.title}
                  title={card.title}
                  subtitle={card.subtitle}
                  onClick={onPrompt ? () => onPrompt(card.query) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
