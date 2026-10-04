import { Link } from 'react-router-dom';
import LabNav from '@/features/lab/components/LabNav';
import SiteFooter from '@/components/layout/SiteFooter';
import LabHeroFallback from '@/components/lab/LabHeroFallback';
import { Sparkles, FlaskConical, BookOpen, Activity, Cpu } from 'lucide-react';

export default function AuthLayout({ eyebrow, title, children }) {
  return (
    <div data-lab="cinematic" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30">
      <LabNav />
      
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl lg:grid-cols-12 gap-8 items-center px-4 sm:px-6 py-8">
        
        {/* Ambient Light Orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Left Hero Section */}
        <section className="lg:col-span-7 flex flex-col justify-center space-y-6 lg:pr-8 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Class 10 SEE Science Socratic Desk
            </div>
            
            <h1 className="font-outfit text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent leading-[1.15]">
              Master Science Through Guided Thinking.
            </h1>
            
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xl">
              Clariq turns complex Grade 10 physics and chemistry concepts into step-by-step Socratic questions, interactive lab benches, and real-time mastery tracking.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-lg">
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Socratic AI Tutor</h4>
                <p className="text-[11px] text-slate-400">Guided hints</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Science Benches</h4>
                <p className="text-[11px] text-slate-400">Physics & Chemistry</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Study Notebook</h4>
                <p className="text-[11px] text-slate-400">Save notes & formulas</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Mastery Signals</h4>
                <p className="text-[11px] text-slate-400">Concept progress graph</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <LabHeroFallback />
          </div>
        </section>

        {/* Right Form Card Section */}
        <section className="lg:col-span-5 flex items-center justify-center relative z-10">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-cyan-950/20 hover:border-cyan-500/30 transition-all">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              {eyebrow}
            </span>
            <h2 className="mt-3 font-outfit text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h2>
            <div className="mt-6">{children}</div>
          </div>
        </section>

      </div>

      <SiteFooter />
    </div>
  );
}
