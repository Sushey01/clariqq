import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import MarketingShell from '@/components/layout/MarketingShell';
import ProgramCard from '@/components/marketing/ProgramCard';
import { PROGRAMS } from '@/content/site';

export default function SubjectsPage() {
  return (
    <MarketingShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        {/* Page Hero Banner */}
        <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              Grade 10 SEE Science Curriculum Tracks
            </div>
            
            <h1 className="font-outfit text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-tight">
              Pick a Grade 10 Science Track.
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Each science bench is an interactive learning track. Explore concept node maps, starter Socratic prompts, and live practice desks designed for Nepal Grade 10 SEE preparation.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> 4 Core Science Benches
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> 68 Socratic Mastery Nodes
              </span>
            </div>
          </div>
        </div>

        {/* 2x2 Grid of Science Program Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.slug} program={program} />
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="text-slate-300">
              Want to see how Socratic AI tutoring compares to traditional textbook self-study?
            </span>
          </div>
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-semibold hover:bg-cyan-500/20 transition-all shrink-0"
          >
            <span>How it works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </main>
    </MarketingShell>
  );
}
