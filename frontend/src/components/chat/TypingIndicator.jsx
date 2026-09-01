export default function TypingIndicator() {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-4 md:px-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-black">
        C
      </div>
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-[#2f2f2f] px-3 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse-subtle" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse-subtle [animation-delay:180ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-pulse-subtle [animation-delay:360ms]" />
      </div>
    </div>
  );
}
