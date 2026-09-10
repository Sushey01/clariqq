export default function TypingIndicator() {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-4 md:px-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[11px] font-semibold text-[var(--bg-canvas)]">
        C
      </div>
      <div className="flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-bubble)] px-3 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink-muted)] animate-pulse-subtle" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink-muted)] animate-pulse-subtle [animation-delay:180ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink-muted)] animate-pulse-subtle [animation-delay:360ms]" />
      </div>
    </div>
  );
}
