export default function LabFrame({ children, className = '' }) {
  return (
    <div
      data-lab="cinematic"
      className={`relative flex min-h-screen flex-col bg-[var(--bg-canvas)] text-[var(--ink)] ${className}`}
    >
      <span className="lab-orb-cyan pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full" />
      <span className="lab-orb-orange pointer-events-none absolute -right-20 top-32 h-80 w-80 rounded-full" />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
