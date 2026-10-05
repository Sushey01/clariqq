export default function PageHero({ eyebrow, title, body, children }) {
  return (
    <section className="hero-band relative overflow-hidden">
      <span className="lab-orb-cyan pointer-events-none absolute -left-16 -top-12 h-56 w-56 rounded-full" />
      <span className="lab-orb-orange pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">{eyebrow}</p>
        ) : null}
        <h1 className="mt-3 max-w-3xl font-outfit text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          {title}
        </h1>
        {body ? (
          <p className="mt-5 max-w-xl text-base leading-relaxed md:text-lg" style={{ color: 'var(--hero-muted)' }}>
            {body}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
