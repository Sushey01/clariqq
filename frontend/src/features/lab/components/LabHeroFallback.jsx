export default function LabHeroFallback() {
  return (
    <div className="nebular-stage nebular-stage-motion" aria-hidden="true">
      <span className="nebular-orbit" />
      <span className="nebular-orbit" style={{ transform: 'rotate(28deg)', opacity: 0.55 }} />
      <span className="nebular-sphere" />
      <span className="nebular-stick" style={{ left: '34%', top: '58%', transform: 'rotate(18deg)' }} />
      <span
        className="nebular-stick"
        style={{
          left: '52%',
          top: '54%',
          transform: 'rotate(-12deg)',
          background: 'linear-gradient(#ffe08a,#d97706)',
        }}
      />
      <span className="absolute left-[62%] top-[22%] h-4 w-4 rounded-full bg-sky-200" />
      <span className="absolute left-[72%] top-[38%] h-5 w-5 rounded-full bg-[var(--n-cyan)]" />
      <span className="absolute left-[22%] top-[42%] h-3 w-3 rounded-full bg-amber-200" />
      <div className="nebular-card nebular-pulse">
        <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'var(--n-faint)' }}>
          Socratic engine live concept pulse
        </p>
        <div className="nebular-pulse-grid">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
