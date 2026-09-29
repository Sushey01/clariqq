const THREAD = [
  {
    who: 'Student',
    text: 'I know the definition, but I cannot explain the idea in my own words.',
  },
  {
    who: 'Clariq',
    text: 'What do you notice first? Name one thing that changes and one thing that stays the same.',
  },
  {
    who: 'Student',
    text: 'So I should compare the situation before and after instead of memorising the line?',
  },
  {
    who: 'Clariq',
    text: 'Exactly. Now turn that comparison into a short reason. What evidence would support it?',
  },
];

export default function LabTutorDesk() {
  return (
    <section id="tutor-preview" className="nebular-section">
      <div className="nebular-wrap nebular-tutor">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--n-cyan)]">
            Question-led tutor
          </p>
          <h2 className="mt-2 font-outfit text-4xl font-semibold leading-tight">
            The tutor does not rush to the final answer.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: 'var(--n-muted)' }}>
            It asks for observations, checks reasoning, and helps students build an explanation step by
            step.
          </p>
        </div>
        <div className="nebular-card p-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span>Clariq practice desk</span>
            <span className="inline-flex items-center gap-1" style={{ color: 'var(--n-cyan)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--n-cyan)]" />
              guided mode
            </span>
          </div>
          {THREAD.map((turn) => (
            <div key={turn.text} className="nebular-desk-row">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--n-cyan)]">
                {turn.who}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{turn.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
