import { STARTER_PROMPTS } from '@/constants/app';
import { Card } from '@/components/ui';

export default function EmptyState({ onPrompt }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pb-8 pt-16 text-center">
      <h1 className="font-outfit text-[28px] font-semibold tracking-tight text-white">
        What are we working on?
      </h1>
      <p className="mt-2 max-w-md text-sm text-zinc-400">
        Grade 10 science tutor. Ask a question and I will guide you instead of
        dumping the answer.
      </p>

      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {STARTER_PROMPTS.map((card) => (
          <Card
            key={card.title}
            hoverable
            onClick={onPrompt ? () => onPrompt(card.query) : undefined}
            hoverable={Boolean(onPrompt)}
            className="h-[88px] text-left"
          >
            <p className="text-sm font-medium text-zinc-100">{card.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              {card.subtitle}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
