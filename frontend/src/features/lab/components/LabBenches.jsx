import { Atom, Dna, Globe, FlaskConical, ArrowRight, Sparkles, Zap, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const BENCHES = [
  {
    n: '01',
    subject: 'Physics',
    line: 'Forces, energy, mechanics, and observational evidence',
    badge: '16 Socratic Nodes',
    tag: 'Grade 10 Mechanics',
    Icon: Atom,
    to: '/demo?subject=physics',
    theme: {
      border: 'border-cyan-500/30 hover:border-cyan-400',
      bgGlow: 'from-cyan-500/15 via-blue-500/5 to-transparent',
      textAccent: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
      glowShadow: 'shadow-[0_0_30px_rgba(34,211,238,0.15)]',
    },
    visual: (
      <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-500/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-blue-500/5 to-transparent opacity-80" />
        {/* Animated Orbits & Nucleus */}
        <div className="relative w-20 h-20 rounded-full border border-cyan-400/40 animate-[spin_12s_linear_infinite] flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-indigo-400/50 animate-[spin_8s_linear_infinite_reverse] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_16px_#22d3ee] flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-slate-950 fill-slate-950" />
            </div>
          </div>
          <div className="absolute top-0 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
        </div>
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono font-medium text-cyan-300/90">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Motion & Thermodynamics</span>
        </div>
      </div>
    ),
  },
  {
    n: '02',
    subject: 'Chemistry',
    line: 'Matter, reactions, periodic law, and molecular reasoning',
    badge: '18 Socratic Nodes',
    tag: 'Grade 10 Reactions',
    Icon: FlaskConical,
    to: '/demo?subject=chemistry',
    theme: {
      border: 'border-purple-500/30 hover:border-purple-400',
      bgGlow: 'from-purple-500/15 via-fuchsia-500/5 to-transparent',
      textAccent: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
      glowShadow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',
    },
    visual: (
      <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-purple-500/20 flex items-center justify-center group-hover:border-purple-500/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-fuchsia-500/5 to-transparent opacity-80" />
        {/* Molecular Bond Nodes */}
        <div className="relative flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-purple-500/25 border border-purple-400/60 flex items-center justify-center shadow-[0_0_14px_#a855f7]">
            <span className="text-xs font-bold text-purple-200">H₂</span>
          </div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 animate-pulse" />
          <div className="w-11 h-11 rounded-full bg-emerald-500/25 border border-emerald-400/60 flex items-center justify-center shadow-[0_0_14px_#10b981]">
            <span className="text-xs font-bold text-emerald-200">O₂</span>
          </div>
        </div>
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono font-medium text-purple-300/90">
          <Flame className="w-3 h-3 text-purple-400" />
          <span>Chemical Kinetics</span>
        </div>
      </div>
    ),
  },
  {
    n: '03',
    subject: 'Biology',
    line: 'Living systems, genetics, organ systems, and careful observation',
    badge: '20 Socratic Nodes',
    tag: 'Grade 10 Physiology',
    Icon: Dna,
    to: '/demo?subject=biology',
    theme: {
      border: 'border-emerald-500/30 hover:border-emerald-400',
      bgGlow: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      textAccent: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      glowShadow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    },
    visual: (
      <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-emerald-500/20 flex items-center justify-center group-hover:border-emerald-500/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-teal-500/5 to-transparent opacity-80" />
        {/* DNA Helix Pulse */}
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_16px_#10b981]">
            <Dna className="w-7 h-7 text-emerald-300 animate-pulse" />
          </div>
          <div className="flex flex-col gap-1 text-[10px] font-mono text-emerald-200">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30">Gene Expression</span>
            <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/30">Nervous System</span>
          </div>
        </div>
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono font-medium text-emerald-300/90">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Cellular Dynamics</span>
        </div>
      </div>
    ),
  },
  {
    n: '04',
    subject: 'Earth Science',
    line: 'Tectonic models, climate systems, geology, and real-world links',
    badge: '14 Socratic Nodes',
    tag: 'Grade 10 Astronomy',
    Icon: Globe,
    to: '/subjects/earth',
    theme: {
      border: 'border-amber-500/30 hover:border-amber-400',
      bgGlow: 'from-amber-500/15 via-orange-500/5 to-transparent',
      textAccent: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      glowShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    },
    visual: (
      <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-amber-500/20 flex items-center justify-center group-hover:border-amber-500/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-orange-500/5 to-transparent opacity-80" />
        {/* Planetary Globe */}
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-teal-600 to-slate-900 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center">
          <Globe className="w-9 h-9 text-amber-100/90 animate-[spin_25s_linear_infinite]" />
        </div>
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono font-medium text-amber-300/90">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Plate Tectonics & Atmosphere</span>
        </div>
      </div>
    ),
  },
];

export default function LabBenches() {
  return (
    <section id="benches" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Section Heading Header */}
      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Science Benches
          </div>
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            A spatial lab for Grade 10 science areas.
          </h2>
        </div>
        <p className="max-w-md text-sm text-slate-400 leading-relaxed">
          No dry syllabus walls or rote memory tests. Each bench connects students to guided Socratic questions, interactive node maps, and conceptual practice.
        </p>
      </div>

      {/* 4 Bench Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BENCHES.map((bench) => {
          const { Icon } = bench;
          return (
            <Link
              key={bench.n}
              to={bench.to}
              className={`group relative flex flex-col justify-between rounded-3xl p-6 bg-slate-900/70 border ${bench.theme.border} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 ${bench.theme.glowShadow} text-decoration-none`}
            >
              {/* Top Header Row */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${bench.theme.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                    {bench.n}
                  </span>
                </div>

                {/* Subject Title & Subtitle */}
                <h3 className="font-outfit text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {bench.subject}
                </h3>
                
                <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {bench.line}
                </p>

                {/* Interactive Visual Canvas Micro-Graphic */}
                {bench.visual}
              </div>

              {/* Bottom Footer Actions */}
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className={`px-2.5 py-1 rounded-full border font-medium text-[11px] ${bench.theme.badgeBg}`}>
                  {bench.badge}
                </span>

                <span className={`inline-flex items-center gap-1 font-semibold ${bench.theme.textAccent} group-hover:translate-x-1 transition-transform`}>
                  Enter Bench
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </Link>
          );
        })}
      </div>

    </section>
  );
}
