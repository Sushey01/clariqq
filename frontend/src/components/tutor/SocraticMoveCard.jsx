import { Badge } from '@/components/ui';
import TutorMarkdown from './TutorMarkdown';

const LABELS = {
  question: { title: 'Tutor question', variant: 'indigo' },
  hint: { title: 'Hint', variant: 'amber' },
  explanation: { title: 'Check this idea', variant: 'zinc' },
};

export default function SocraticMoveCard({ kind = 'question', text, yourTurn = false }) {
  const meta = LABELS[kind] || LABELS.question;
  const accent =
    kind === 'question'
      ? 'border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[var(--accent-soft)]'
      : kind === 'hint'
        ? 'border-[color-mix(in_srgb,#f59e0b_35%,var(--border))] bg-[var(--bg-card)]'
        : 'border-[var(--border)] bg-[var(--bg-card)]';

  return (
    <div className="w-full py-3">
      <div className={`lab-glass rounded-3xl px-5 py-4 ${accent}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="font-outfit text-sm font-semibold text-[var(--ink)]">Clariq</p>
          <Badge variant={meta.variant} size="sm">
            {meta.title}
          </Badge>
          {yourTurn ? (
            <Badge variant="indigo" size="sm">
              Your turn
            </Badge>
          ) : null}
        </div>
        <TutorMarkdown>{text}</TutorMarkdown>
      </div>
    </div>
  );
}
