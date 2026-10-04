import { Link } from 'react-router-dom';
import { Atom, FlaskConical, Dna, Globe, ArrowRight, CheckCircle2, Quote } from 'lucide-react';

const SUBJECT_THEMES = {
  physics: {
    Icon: Atom,
    nodes: '16 Concept Nodes',
    border: 'border-cyan-500/30 hover:border-cyan-400',
    bgGlow: 'from-cyan-500/15 via-blue-500/5 to-transparent',
    textAccent: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    bulletDot: 'text-cyan-400',
    glowShadow: 'shadow-[0_0_30px_rgba(34,211,238,0.12)]',
    quoteBorder: 'border-cyan-500/20 bg-cyan-950/20',
  },
  chemistry: {
    Icon: FlaskConical,
    nodes: '18 Concept Nodes',
    border: 'border-purple-500/30 hover:border-purple-400',
    bgGlow: 'from-purple-500/15 via-fuchsia-500/5 to-transparent',
    textAccent: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    bulletDot: 'text-purple-400',
    glowShadow: 'shadow-[0_0_30px_rgba(168,85,247,0.12)]',
    quoteBorder: 'border-purple-500/20 bg-purple-950/20',
  },
  biology: {
    Icon: Dna,
    nodes: '20 Concept Nodes',
    border: 'border-emerald-500/30 hover:border-emerald-400',
    bgGlow: 'from-emerald-500/15 via-teal-500/5 to-transparent',
    textAccent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    bulletDot: 'text-emerald-400',
    glowShadow: 'shadow-[0_0_30px_rgba(16,185,129,0.12)]',
    quoteBorder: 'border-emerald-500/20 bg-emerald-950/20',
  },
  earth: {
    Icon: Globe,
    nodes: '14 Concept Nodes',
    border: 'border-amber-500/30 hover:border-amber-400',
    bgGlow: 'from-amber-500/15 via-orange-500/5 to-transparent',
    textAccent: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    bulletDot: 'text-amber-400',
    glowShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.12)]',
    quoteBorder: 'border-amber-500/20 bg-amber-950/20',
  },
};

export default function ProgramCard({ program }) {
  const theme = SUBJECT_THEMES[program.slug] || SUBJECT_THEMES.physics;
  const { Icon } = theme;

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-3xl p-7 bg-slate-900/70 border ${theme.border} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 ${theme.glowShadow}`}
    >
      {/* Subject Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${theme.badgeBg} group-hover:scale-105 transition-transform`}>
              <Icon className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Grade 10 SEE Science
              </span>
              <h3 className="font-outfit text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {program.subject}
              </h3>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${theme.badgeBg}`}>
            {theme.nodes}
          </span>
        </div>

        {/* Subtitle / Blurb */}
        <p className="mt-2 text-xs text-slate-300 leading-relaxed font-medium">
          {program.blurb}
        </p>

        {/* Learning Points Bullet List */}
        <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
          {program.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-slate-950/60 border border-white/5">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${theme.bulletDot}`} />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Student Testimonial Quote */}
        {program.quote && (
          <div className={`mt-5 p-4 rounded-2xl border ${theme.quoteBorder} space-y-1`}>
            <div className="flex items-start gap-2 text-slate-200 italic text-xs leading-relaxed">
              <Quote className={`w-4 h-4 shrink-0 mt-0.5 ${theme.textAccent}`} />
              <span>"{program.quote}"</span>
            </div>
            <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider pt-1 pl-6">
              — {program.quoteBy}
            </p>
          </div>
        )}
      </div>

      {/* Card Action Buttons */}
      <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between gap-3">
        <Link
          to={`/demo?subject=${program.slug}`}
          className="px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-all shadow-xs"
        >
          Try Demo ⚡
        </Link>
        <Link
          to={`/subjects/${program.slug}`}
          className={`inline-flex items-center gap-1.5 text-xs font-bold ${theme.textAccent} group-hover:translate-x-1 transition-transform`}
        >
          <span>Open Bench</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
