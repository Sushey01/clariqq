export default function StudentTurn({ text }) {
  return (
    <div className="flex w-full justify-end py-3">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <p className="mb-1 text-right text-[10px] font-medium uppercase tracking-wide text-[var(--ink-faint)]">
          Your reasoning
        </p>
        <div className="lab-glass rounded-[1.5rem] rounded-tr-md px-5 py-3 text-[15px] leading-relaxed text-[var(--ink)]">
          {text}
        </div>
      </div>
    </div>
  );
}
