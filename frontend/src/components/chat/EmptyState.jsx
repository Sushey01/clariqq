import { STARTER_PROMPTS, SUBJECTS } from '@/constants/app';
import { Card } from '@/components/ui';

export default function EmptyState({ onPrompt }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pb-8 pt-12 text-center">
      <h1 className="font-outfit text-[28px] font-semibold tracking-tight text-[var(--ink)]">
        What are we working on?
      </h1>
      <p className="mt-2 max-w-md text-sm text-[var(--ink-muted)]">
        Grade 10 science tutor. I will not dump the answer. I will ask one question
        at a time so you stay in the thinking.
      </p>

      {SUBJECTS.map((subject) => (
        <div key={subject} className="mt-6 w-full text-left">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            {subject}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {STARTER_PROMPTS.filter((card) => card.subject === subject).map((card) => (
              <Card
                key={card.title}
                hoverable={Boolean(onPrompt)}
                onClick={onPrompt ? () => onPrompt(card.query) : undefined}
                className="h-auto min-h-[88px] text-left"
              >
                <p className="text-sm font-medium text-[var(--ink)]">{card.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">
                  {card.subtitle}
                </p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
