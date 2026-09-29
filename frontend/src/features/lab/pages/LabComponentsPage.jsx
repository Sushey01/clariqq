import LabLayout from '@/features/lab/components/LabLayout';
import LabHero from '@/features/lab/components/LabHero';
import LabBenches from '@/features/lab/components/LabBenches';
import LabTutorDesk from '@/features/lab/components/LabTutorDesk';
import LabSignals from '@/features/lab/components/LabSignals';
import LabFooterCta from '@/features/lab/components/LabFooterCta';

const BLOCKS = [
  { name: 'Hero', node: <LabHero /> },
  { name: 'Lab benches', node: <LabBenches /> },
  { name: 'Tutor desk', node: <LabTutorDesk /> },
  { name: 'Progress signals', node: <LabSignals /> },
  { name: 'Footer CTA', node: <LabFooterCta /> },
];

export default function LabComponentsPage() {
  return (
    <LabLayout>
      <section className="nebular-section">
        <div className="nebular-wrap">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--n-cyan)]">
            Components
          </p>
          <h1 className="mt-2 font-outfit text-4xl font-semibold">Preview the lab pieces.</h1>
          <p className="mt-3 max-w-xl text-sm" style={{ color: 'var(--n-muted)' }}>
            Feature module at <code>src/features/lab</code>: pages, layout, section components, and a
            lazy 3D hero scene.
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
    </LabLayout>
  );
}
