import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, FlaskConical, MessageSquare, Calendar, Zap, Sparkles, BarChart3, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useChatSessions } from '@/hooks/useChatSessions';
import { PENDING_PROMPT_KEY } from '@/constants/app';
import { PROGRAMS } from '@/content/site';
import LabLayout from '@/features/lab/components/LabLayout';
import MaterialsPanel from '@/components/learning/MaterialsPanel';
import StudentHubBarGraph from '@/features/progress/components/StudentHubBarGraph';

const BENCH_ACCENT = {
  physics: '#22d3ee',
  chemistry: '#a855f7',
  biology: '#10b981',
  earth: '#f59e0b',
};

function lastActiveSession(sessions) {
  return [...sessions]
    .filter((session) => (session.messages || []).length > 0)
    .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0))[0];
}

function threadsThisWeek(sessions) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => (session.updatedAt || session.createdAt || 0) >= weekAgo).length;
}

export default function HubPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sessions, createChat, setActiveSessionId } = useChatSessions();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const last = lastActiveSession(sessions);
  const weekCount = threadsThisWeek(sessions);
  const threadCount = sessions.filter((session) => (session.messages || []).length > 0).length;

  const openChat = (sessionId) => {
    if (sessionId) setActiveSessionId(sessionId);
    navigate('/app/chat');
  };

  const startTopic = (query) => {
    createChat();
    try {
      sessionStorage.setItem(PENDING_PROMPT_KEY, query);
    } catch {
      /* ignore */
    }
    navigate('/app/chat');
  };

  return (
    <LabLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        
        {/* Hero Banner Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome back{user.name ? ` · ${user.name.split(' ')[0]}` : ''}
            </div>
            <h1 className="font-outfit text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent leading-tight">
              Choose a bench. Then take a turn.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
              This is the student lab floor. Pick a science bench, launch a topic inquiry, or continue your active Socratic question path.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/chat')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-95 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            Open Socratic Desk
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Question Paths */}
          <div className="p-6 rounded-3xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-cyan-500/40 transition-all">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Question Paths</p>
              <p className="mt-2 font-outfit text-3xl font-bold text-white">{threadCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: This Week */}
          <div className="p-6 rounded-3xl border border-emerald-500/20 bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-emerald-500/40 transition-all">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">This Week</p>
              <p className="mt-2 font-outfit text-3xl font-bold text-white">{weekCount} threads</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Mastery Level */}
          <div className="p-6 rounded-3xl border border-amber-500/20 bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-amber-500/40 transition-all">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Mastery Avg</p>
              <p className="mt-2 font-outfit text-3xl font-bold text-white">81% <span className="text-xs font-semibold text-emerald-400 font-mono">+6%</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Last Active Bench */}
          <div className="p-6 rounded-3xl border border-purple-500/20 bg-slate-900/60 backdrop-blur-xl shadow-xl flex items-center justify-between hover:border-purple-500/40 transition-all">
            <div className="overflow-hidden pr-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Last Bench</p>
              <p className="mt-2 font-outfit text-lg font-bold text-slate-200 truncate">{last?.title || 'None active'}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* 📊 INTERACTIVE SOCRATIC PROGRESS BAR GRAPH */}
        <StudentHubBarGraph />

        {/* Continue Last Path Banner */}
        {last ? (
          <button
            type="button"
            onClick={() => openChat(last.id)}
            className="group w-full p-5 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/40 backdrop-blur-xl flex items-center justify-between text-left hover:border-cyan-400 transition-all shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Resume Active Socratic Path
                </span>
                <span className="mt-0.5 block text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                  {last.title}
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : null}

        {/* Course Materials & Syllabus Panel */}
        <MaterialsPanel />

        {/* 4 Science Stations */}
        <section className="space-y-6 pt-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Grade 10 Curriculum Benches
            </span>
            <h2 className="mt-1 font-outfit text-3xl font-bold text-white">Four Science Stations</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {PROGRAMS.map((program) => {
              const accentColor = BENCH_ACCENT[program.slug] || '#22d3ee';
              return (
                <article
                  key={program.slug}
                  className="rounded-3xl p-7 bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-4 hover:border-slate-700 transition-all"
                  style={{ boxShadow: `inset 0 0 0 1px ${accentColor}25` }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-full border"
                      style={{
                        color: accentColor,
                        backgroundColor: `${accentColor}15`,
                        borderColor: `${accentColor}30`,
                      }}
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      Open Station
                    </span>
                    <span className="text-xs font-mono text-slate-500">Grade 10 SEE</span>
                  </div>

                  <div>
                    <h3 className="font-outfit text-2xl font-bold text-white">{program.subject}</h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{program.blurb}</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    {program.topics.map((topic) => (
                      <button
                        key={topic.title}
                        type="button"
                        onClick={() => startTopic(topic.query)}
                        className="group flex w-full items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3 text-left hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all"
                      >
                        <div>
                          <span className="block text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                            {topic.title}
                          </span>
                          <span className="block text-[11px] text-slate-400 mt-0.5">{topic.subtitle}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      </main>
    </LabLayout>
  );
}
