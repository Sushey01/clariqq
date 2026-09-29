import { Atom, Dna, Eye, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';

const BENCHES = [
  { n: '01', subject: 'Physics', line: 'Forces, patterns, and evidence', Icon: Atom, to: '/demo' },
  { n: '02', subject: 'Chemistry', line: 'Matter, reactions, and reasoning', Icon: FlaskConical, to: '/demo' },
  { n: '03', subject: 'Biology', line: 'Living systems and careful observation', Icon: Dna, to: '/demo' },
  { n: '04', subject: 'Earth Science', line: 'Models, change, and real-world links', Icon: Eye, to: '/subjects/earth' },
];

export default function LabBenches() {
  return (
    <section id="benches" className="nebular-section">
      <div className="nebular-wrap">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--n-cyan)]">
              Choose a bench
            </p>
            <h2 className="mt-2 max-w-md font-outfit text-4xl font-semibold">
              A spatial lab for the big science areas.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: 'var(--n-muted)' }}>
            The homepage stays light: no syllabus lists, no wall of chapters. Each bench points students
            toward exploration and question-led practice.
          </p>
        </div>
        <div className="nebular-benches">
          {BENCHES.map((bench) => (
            <Link key={bench.n} to={bench.to} className="nebular-card block p-5 no-underline text-inherit">
              <div className="flex items-start justify-between">
                <span className="nebular-brand-mark">
                  <bench.Icon size={16} />
                </span>
                <span className="text-[11px]" style={{ color: 'var(--n-faint)' }}>
                  {bench.n}
                </span>
              </div>
              <div className="nebular-glow mt-6" />
              <h3 className="mt-5 font-outfit text-xl font-semibold">{bench.subject}</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--n-muted)' }}>
                {bench.line}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
