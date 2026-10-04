import { Badge } from '@/components/ui';
import TutorMarkdown from './TutorMarkdown';
import GroundingBadge from '@/components/chat/GroundingBadge';

const LABELS = {
  question: { title: 'Tutor question', variant: 'indigo' },
  hint: { title: 'Hint', variant: 'amber' },
  explanation: { title: 'Check this idea', variant: 'zinc' },
};

export default function SocraticMoveCard({
  kind = 'question',
  text,
  yourTurn = false,
  sources,
  personaName = 'Clariq',
}) {
  const meta = LABELS[kind] || LABELS.question;
  const accent =
    kind === 'question'
      ? 'border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] bg-[var(--accent-soft)]'
      : kind === 'hint'
        ? 'border-[color-mix(in_srgb,#f59e0b_35%,var(--border))] bg-[var(--bg-card)]'
        : 'border-[var(--border)] bg-[var(--bg-card)]';

  return (
    <div className="w-full py-2">
      <div className={`lab-glass rounded-3xl px-5 py-4 ${accent}`}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="font-outfit text-sm font-semibold text-[var(--ink)]">{personaName}</p>
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

        {/* Interactive Grounding Badges */}
        {Array.isArray(sources) && sources.length > 0 ? (
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] mb-2 font-semibold">
              Grounding Citations & Sources
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((item, index) => (
                <GroundingBadge key={index} source={item} index={index} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
