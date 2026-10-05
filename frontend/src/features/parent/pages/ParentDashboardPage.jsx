import { useEffect, useState } from 'react';
import { getParentChild, getParentChildWeekly } from '@/api/client';
import ParentLayout from '@/features/parent/components/ParentLayout';
import MasteryCard from '@/features/progress/components/MasteryCard';
import ParentReviewPanel from '@/features/parent/components/ParentReviewPanel';
import RequestTeacherLessonCard from '@/features/parent/components/RequestTeacherLessonCard';
import TeacherReportsCard from '@/features/parent/components/TeacherReportsCard';
import ParentWeeklyTestReview from '@/features/parent/components/ParentWeeklyTestReview';
import LinkChildWidget from '@/features/parent/components/LinkChildWidget';
import {
  Sparkles,
  Target,
  MessageSquare,
  BookOpen,
  CheckCircle2,
  LayoutDashboard,
  GraduationCap,
  FileCheck,
  FileText,
  UserCheck,
  Search,
  Award,
  Flame,
  BarChart3,
  TrendingUp,
  Link2,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft
} from 'lucide-react';

export default function ParentDashboardPage() {
  const [child, setChild] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getParentChild(), getParentChildWeekly()])
      .then(([childData, weeklyData]) => {
        if (cancelled) return;
        setChild(childData);
        setWeekly(weeklyData);
      })
      .catch((exc) => {
        if (!cancelled) setError(exc.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const confused = weekly?.confused || [];
  const weakest = weekly?.weakest || [];
  const practiceTarget = confused[0] || weakest[0];

  return (
    <ParentLayout>
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 py-6 font-sans text-slate-100">
        
        {/* DASHBOARD FLEX CONTAINER (Sidebar + Main Content) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* 1. REFACTORED SIDEBAR PANEL (Collapsible w-72 -> w-20) */}
          <aside
            className={`rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-2xl shadow-2xl shadow-cyan-950/20 sticky top-20 transition-all duration-300 z-30 shrink-0 ${
              sidebarCollapsed ? 'w-20 p-3.5 flex flex-col items-center' : 'w-full lg:w-72 p-5 space-y-6'
            }`}
          >
            
            {/* Sidebar Top Header with Prominent Expand/Collapse Toggle Button at Very Top when Shrunk */}
            <div className={`flex items-center w-full pb-4 border-b border-white/10 ${sidebarCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'}`}>
              {sidebarCollapsed ? (
                <>
                  {/* 1. EXPAND ICON AT VERY TOP WHEN SHRUNK */}
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    className="w-12 h-12 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500 border border-cyan-500/50 text-cyan-300 hover:text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    title="Expand Sidebar Menu"
                  >
                    <PanelLeftOpen className="w-6 h-6" />
                  </button>

                  {/* 2. Child Avatar initial below expand icon */}
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold font-outfit text-base shadow-sm" title={`Parent Supervision (${child?.name || 'Aarav'})`}>
                    {child?.name ? child.name.charAt(0) : 'P'}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold font-outfit text-base shadow-sm">
                      {child?.name ? child.name.charAt(0) : 'P'}
                    </div>
                    <div>
                      <h3 className="font-outfit font-bold text-sm text-white leading-tight">Parent Supervision</h3>
                      <p className="text-[11px] text-slate-400">Linked: <span className="text-cyan-300 font-semibold">{child?.name || 'Aarav'}</span></p>
                    </div>
                  </div>

                  {/* COLLAPSE ICON BUTTON (NO TEXT 'Shrink') */}
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 flex items-center justify-center transition-all"
                    title="Collapse Sidebar for Full View"
                  >
                    <PanelLeftClose className="w-5 h-5 text-cyan-400" />
                  </button>
                </>
              )}
            </div>

            {/* Vertical Navigation Menu Buttons */}
            <nav className={`space-y-2 text-xs font-semibold w-full ${sidebarCollapsed ? 'mt-4 flex flex-col items-center space-y-3' : ''}`}>
              {!sidebarCollapsed && (
                <div className="px-2 pb-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Dashboard Navigation
                </div>
              )}

              {/* Overview Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                title="Dashboard Overview"
                className={`transition-all ${
                  sidebarCollapsed
                    ? `w-12 h-12 rounded-2xl flex items-center justify-center ${
                        activeTab === 'overview'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                      }`
                    : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === 'overview'
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4 text-cyan-400'} />
                  {!sidebarCollapsed && <span>Dashboard Overview</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {/* Weekly Test Reviews Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                title="Weekly Test Reviews"
                className={`transition-all ${
                  sidebarCollapsed
                    ? `w-12 h-12 rounded-2xl flex items-center justify-center ${
                        activeTab === 'reviews'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
                      }`
                    : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === 'reviews'
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4 text-emerald-400'} />
                  {!sidebarCollapsed && <span>Weekly Test Reviews</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {/* Teacher Reports Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                title="Teacher Reports"
                className={`transition-all ${
                  sidebarCollapsed
                    ? `w-12 h-12 rounded-2xl flex items-center justify-center ${
                        activeTab === 'reports'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-purple-300 hover:bg-slate-800'
                      }`
                    : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === 'reports'
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4 text-purple-400'} />
                  {!sidebarCollapsed && <span>Teacher Reports</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {/* Lesson Coverage Requests Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                title="Lesson Coverage Requests"
                className={`transition-all ${
                  sidebarCollapsed
                    ? `w-12 h-12 rounded-2xl flex items-center justify-center ${
                        activeTab === 'requests'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-800'
                      }`
                    : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === 'requests'
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4 text-amber-400'} />
                  {!sidebarCollapsed && <span>Lesson Coverage Requests</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>
            </nav>

            {/* Active Student Link Status Box (Hidden when collapsed) */}
            {!sidebarCollapsed && (
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Account Linking</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="font-bold text-white text-sm">{child?.name || 'Aarav Sharma'}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Code: <span className="font-mono text-cyan-300">{child?.code || 'STU-9482'}</span></span>
                  <span className="text-emerald-400 font-semibold">● Active</span>
                </div>
              </div>
            )}

          </aside>


          {/* 2. MAIN WORKSPACE CONTAINER (Expands smoothly to fill width) */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* TOP SUB-HEADER & TAB CONTROLS BANNER */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Parent Supervision Desk
                  </div>
                  <h1 className="font-outfit text-3xl font-extrabold text-white tracking-tight">
                    Weekly Learning Signals for {child?.name || 'Aarav Sharma'}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative hidden sm:block">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search concepts or signals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56"
                    />
                  </div>
                  <a
                    href="#link-section"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Link Child
                  </a>
                </div>
              </div>

              {/* Filter Pills Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                  }`}
                >
                  📊 Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === 'reviews'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                  }`}
                >
                  📝 Weekly Reviews
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === 'reports'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                  }`}
                >
                  👩‍🏫 Teacher Reports
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === 'requests'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                  }`}
                >
                  💡 Lesson Requests
                </button>
              </div>
            </div>


            {/* 3. TOP KPI STAT CARDS ROW (4 Metric Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Subjects Completed */}
              <div className="p-5 rounded-3xl border border-amber-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">Courses / Subjects</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mt-3">4 Modules</h3>
                <p className="text-xs text-amber-300 font-semibold mt-1">90% Completed</p>
              </div>

              {/* Card 2: Active Streak */}
              <div className="p-5 rounded-3xl border border-rose-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-rose-500/50 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-400 tracking-wider">Active Streak</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mt-3">5 Days</h3>
                <p className="text-xs text-rose-300 font-semibold mt-1">100% Consistency</p>
              </div>

              {/* Card 3: Concept Mastery */}
              <div className="p-5 rounded-3xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider">Concept Mastery</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mt-3">78% Avg</h3>
                <p className="text-xs text-cyan-300 font-semibold mt-1">12 Mastered Nodes</p>
              </div>

              {/* Card 4: Weekly Test Gain */}
              <div className="p-5 rounded-3xl border border-emerald-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">Test Gains</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mt-3">+24% Gain</h3>
                <p className="text-xs text-emerald-300 font-semibold mt-1">82% Score Avg</p>
              </div>

            </div>


            {/* Loading / Error States */}
            {loading ? <p className="text-xs text-slate-400 animate-pulse">Loading child progress report…</p> : null}
            {error ? <p className="text-xs text-rose-300">{error}</p> : null}


            {/* 4. MAIN ANALYTICS & CONTENT GRID (Left 8 cols + Right 4 cols) */}
            <div className="grid lg:grid-cols-12 gap-6">

              {/* Left Column (8 cols): Primary Cards & Reports */}
              <div className="lg:col-span-8 space-y-6">

                {/* High-Priority Learning Focus Card */}
                {practiceTarget ? (
                  <div className="p-6 rounded-3xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl flex items-start justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                          Child's High-Priority Learning Focus
                        </span>
                      </div>
                      <h3 className="font-outfit text-2xl font-bold text-white pt-1">
                        {practiceTarget.name || practiceTarget.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl pt-1">
                        This is the science concept where {child?.name || 'your child'} had lower confidence or repeated questions this week. Ask them to explain this concept in their own words at the Clariq Socratic desk.
                      </p>
                    </div>
                  </div>
                ) : !loading && !error ? (
                  <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    No stuck topics recorded this week! All completed science tracks are progressing cleanly.
                  </div>
                ) : null}

                {/* 1. WEEKLY TEST REVIEW & COMPLETED SUBJECTS */}
                {(activeTab === 'overview' || activeTab === 'reviews') && (
                  <div id="reviews">
                    <ParentWeeklyTestReview child={child} />
                  </div>
                )}

                {/* 2. DIRECT TEACHER EVALUATION REPORTS */}
                {(activeTab === 'overview' || activeTab === 'reports') && (
                  <div id="reports">
                    <TeacherReportsCard child={child} />
                  </div>
                )}

                {/* 3. REQUEST TEACHER LESSON COVERAGE */}
                {(activeTab === 'overview' || activeTab === 'requests') && (
                  <RequestTeacherLessonCard child={child} />
                )}

                {/* 4. PARENT SOCRATIC STARTERS & ENCOURAGEMENT */}
                <ParentReviewPanel child={child} confusedNodes={confused} weakestNodes={weakest} />

              </div>


              {/* Right Column (4 cols): Account Link & Quick Roster Panel */}
              <div className="lg:col-span-4 space-y-6">

                {/* Account Linking Widget */}
                <div id="link-section">
                  <LinkChildWidget currentChild={child} />
                </div>

                {/* Topics Needing Home Conversation */}
                <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl space-y-4 shadow-xl">
                  <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    Topics Needing Conversation
                  </h3>
                  <p className="text-xs text-slate-400">Concepts with low confidence this week.</p>
                  
                  <div className="space-y-3">
                    {confused.length === 0 && !loading ? (
                      <p className="text-xs text-slate-400">Nothing marked confused this week.</p>
                    ) : null}
                    {confused.slice(0, 3).map((node) => (
                      <MasteryCard key={node.concept_id || node.id} node={node} />
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </main>

        </div>

      </div>
    </ParentLayout>
  );
}
