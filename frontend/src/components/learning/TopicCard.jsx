import { Card } from '@/components/ui';

export default function TopicCard({ title, subtitle, onClick, hoverable = Boolean(onClick) }) {
  return (
    <Card hoverable={hoverable} onClick={onClick} className="h-auto min-h-[96px] text-left">
      <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--ink-muted)]">{subtitle}</p>
    </Card>
  );
}
