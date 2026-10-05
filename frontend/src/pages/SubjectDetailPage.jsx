import { Link, Navigate, useParams } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Quote, BookOpen } from 'lucide-react';
import { programBySlug } from '@/content/site';
import MarketingShell from '@/components/layout/MarketingShell';
import TryDemoButton from '@/components/auth/TryDemoButton';

export default function SubjectDetailPage() {
  const { slug } = useParams();
  const program = programBySlug(slug);

  if (!program) {
    return <Navigate to="/subjects" replace />;
  }

  return (
    <MarketingShell>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        {/* Subject Detail Glass Hero Banner */}
        <div className="p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              {program.kicker} · {program.subject} Track
            </div>

            <h1 className="font-outfit text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-tight">
              {program.headline}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {program.blurb}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <TryDemoButton variant="hero" label="Start Socratic Practice ⚡" />
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-full border border-slate-700 bg-slate-900/80 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-500 transition-all shadow-xs"
              >
                Sign Up for Full History
              </Link>
            </div>
          </div>
        </div>

        {/* Content Details & Starter Topics Grid */}
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          
          {/* What You Will Practice */}
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Curriculum Focus</span>
              <h2 className="font-outfit text-3xl font-bold text-white mt-1">What you will practice</h2>
            </div>

            <ul className="space-y-3 text-xs text-slate-300">
              {program.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>

            {program.quote && (
              <blockquote className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 space-y-2">
                <div className="flex items-start gap-2 text-slate-200 italic text-xs leading-relaxed">
                  <Quote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>"{program.quote}"</span>
                </div>
                <footer className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider pl-6">
                  — {program.quoteBy}
                </footer>
              </blockquote>
            )}
          </div>

          {/* Starter Topics Sidebar */}
          <aside className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Starter Socratic Topics
              </span>
              <h3 className="font-outfit text-2xl font-bold text-white mb-4">Interactive Sessions</h3>

              <div className="space-y-3">
                {program.topics.map((topic) => (
                  <Link
                    key={topic.title}
                    to="/demo"
                    className="group block p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {topic.title}
                      </p>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{topic.subtitle}</p>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/subjects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ← Back to All Subjects
            </Link>
          </aside>

        </div>

      </main>
    </MarketingShell>
  );
}
