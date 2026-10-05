import { MessageCircleQuestion } from 'lucide-react';

export default function YourTurnBar({ visible }) {
  if (!visible) return null;
  return (
    <div
      className="mx-auto mb-2 flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] px-3 py-2 text-xs text-[var(--ink)]"
      role="status"
      aria-live="polite"
    >
      <MessageCircleQuestion className="h-4 w-4 shrink-0 text-[var(--accent)]" />
      <span>Your turn — answer the tutor before asking something new.</span>
    </div>
  );
}
