import '@/nebular/nebular.css';
import NebularNav from '@/nebular/NebularNav';
import NebularHero from '@/nebular/NebularHero';
import NebularBenches from '@/nebular/NebularBenches';
import NebularTutorDesk from '@/nebular/NebularTutorDesk';
import NebularSignals from '@/nebular/NebularSignals';
import NebularFooterCta from '@/nebular/NebularFooterCta';

const BLOCKS = [
  { name: 'Hero', node: <NebularHero /> },
  { name: 'Lab benches', node: <NebularBenches /> },
  { name: 'Tutor desk', node: <NebularTutorDesk /> },
  { name: 'Progress signals', node: <NebularSignals /> },
  { name: 'Footer CTA', node: <NebularFooterCta /> },
];

export default function NebularPreview() {
  return (
    <div className="nebular">
      <NebularNav />
      <section className="nebular-section">
        <div className="nebular-wrap">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--n-cyan)]">
            Components
          </p>
          <h1 className="mt-2 font-outfit text-4xl font-semibold">Preview the lab pieces.</h1>
          <p className="mt-3 max-w-xl text-sm" style={{ color: 'var(--n-muted)' }}>
            New Clariq lab components, matching the nebular quest layout. These sit besides the old
            app files instead of rewriting them.
          </p>
        </div>
      </section>
      {BLOCKS.map((block) => (
        <div key={block.name}>
          <div className="nebular-wrap px-5">
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--n-faint)' }}>
              Component · {block.name}
            </p>
          </div>
          {block.node}
        </div>
      ))}
    </div>
  );
}
