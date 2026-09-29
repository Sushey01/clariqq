import { Link } from 'react-router-dom';
import { ArrowRight, ScanEye } from 'lucide-react';
import LabHeroIsland from '@/features/lab/components/LabHeroIsland';

export default function LabHero() {
  return (
    <section id="top" className="nebular-section nebular-grid">
      <div className="nebular-wrap nebular-hero-grid">
        <div>
          <p className="nebular-kicker">
            <ScanEye size={14} />
            Built for Class 10 Nepal science learners
          </p>
          <h1 className="mt-6 font-outfit text-5xl font-semibold leading-[1.05] md:text-6xl">
            Learn science
            <br />
            by thinking,
            <span className="ml-2 inline-block h-3 w-3 rounded-full bg-[var(--n-cyan)] align-middle" />
            <br />
            not copying answers.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed" style={{ color: 'var(--n-muted)' }}>
            Clariq turns tough ideas into guided questions, helps students explain their reasoning, and
            gives teachers clear learning signals.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/demo" className="nebular-cta">
              Start a question path
              <ArrowRight size={16} />
            </Link>
            <a href="#benches" className="nebular-ghost">
              Enter the lab
            </a>
          </div>
        </div>
        <LabHeroIsland />
      </div>
    </section>
  );
}
