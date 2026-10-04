import { useEffect, useState } from 'react';
import { getTeacherStudents, getTeacherStudentWeekly } from '@/api/client';
import TeacherLayout from '@/features/teacher/components/TeacherLayout';
import MasteryCard from '@/features/progress/components/MasteryCard';
import TeacherReviewPanel from '@/features/teacher/components/TeacherReviewPanel';
import SendParentReportModal from '@/features/teacher/components/SendParentReportModal';
import ClassPerformanceGraph from '@/features/teacher/components/ClassPerformanceGraph';
import StudentDetailModal from '@/features/teacher/components/StudentDetailModal';
import { downloadJson } from '@/features/progress/lib/mastery';
import {
  Sparkles,
  Award,
  User,
  Download,
  Send,
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Search,
  Flame,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Mail,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const HUMAN_STUDENT_ROSTER = [
  { id: 'stu-1', name: 'Aarav Sharma', email: 'aarav.sharma@school.edu', code: 'STU-9482', parentEmail: 'parent.aarav@clariq.edu', mastery: 78 },
  { id: 'stu-2', name: 'Bina Thapa', email: 'bina.thapa@school.edu', code: 'STU-1024', parentEmail: 'parent.bina@clariq.edu', mastery: 84 },
  { id: 'stu-3', name: 'Chirag Shrestha', email: 'chirag.shrestha@school.edu', code: 'STU-5541', parentEmail: 'parent.chirag@clariq.edu', mastery: 69 },
  { id: 'stu-4', name: 'Diya Karki', email: 'diya.karki@school.edu', code: 'STU-3329', parentEmail: 'parent.diya@clariq.edu', mastery: 91 },
  { id: 'stu-5', name: 'Dipesh Subedi', email: 'dipesh.subedi@school.edu', code: 'STU-8812', parentEmail: 'parent.dipesh@clariq.edu', mastery: 73 },
];

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState(HUMAN_STUDENT_ROSTER);
  const [weekly, setWeekly] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals, Tabs & Sidebar state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [targetStudentForReport, setTargetStudentForReport] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('stu-1');
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getTeacherStudents()
      .then(async (list) => {
        if (cancelled) return;
        if (list && list.length > 0) {
          const merged = list.map((item, idx) => ({
            ...HUMAN_STUDENT_ROSTER[idx % HUMAN_STUDENT_ROSTER.length],
            ...item,
          }));
          setStudents(merged);
        }
        const report = await getTeacherStudentWeekly(HUMAN_STUDENT_ROSTER[0].id);
        if (!cancelled) setWeekly(report);
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

  const handleOpenStudentDetail = async (studentId) => {
    setSelectedStudentId(studentId);
    setDetailModalOpen(true);
    try {
      const report = await getTeacherStudentWeekly(studentId);
      setWeekly(report);
    } catch {
      /* fallback */
    }
  };

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  const confused = weekly?.confused || [];
  const weakest = weekly?.weakest || [];

  return (
    <TeacherLayout>
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-6 font-sans text-slate-100">
        
        {/* DASHBOARD FLEX CONTAINER (Sidebar + Main Content) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* 1. REFACTORED SIDEBAR PANEL (Collapsible w-72 -> w-20) */}
          <aside
            className={`rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-2xl shadow-2xl shadow-cyan-950/20 sticky top-20 transition-all duration-300 z-30 shrink-0 ${
              sidebarCollapsed ? 'w-20 p-3.5 flex flex-col items-center' : 'w-full lg:w-72 p-5'
            }`}
          >
            {/* Sidebar Top Header with Prominent Expand/Collapse Button at Very Top when Shrunk */}
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

                  {/* 2. Initial Avatar badge below expand icon */}
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold font-outfit text-base shadow-sm" title="Teacher Desk">
                    T
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold font-outfit text-base shadow-sm">
                      T
                    </div>
                    <div>
                      <h3 className="font-outfit font-bold text-sm text-white leading-tight">Teacher Desk</h3>
                      <p className="text-[11px] text-slate-400">Class 10 Science</p>
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

            {/* Navigation Menu Buttons */}
            <nav className={`space-y-2 mt-4 w-full ${sidebarCollapsed ? 'flex flex-col items-center space-y-3' : ''}`}>
              {!sidebarCollapsed && (
                <div className="px-2 pb-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Supervision Controls
                </div>
              )}

              {/* Class Overview Button */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                title="Class Overview"
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
                  {!sidebarCollapsed && <span>Class Overview</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {/* Students List Button */}
              <button
                type="button"
                onClick={() => setActiveTab('students')}
                title="Enrolled Students"
                className={`transition-all ${
                  sidebarCollapsed
                    ? `w-12 h-12 rounded-2xl flex items-center justify-center relative ${
                        activeTab === 'students'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
                      }`
                    : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === 'students'
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4 text-emerald-400'} />
                  {!sidebarCollapsed && <span>Students</span>}
                </div>
                {!sidebarCollapsed ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                    {students.length}
                  </span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5" />
                )}
              </button>

              {/* Socratic Reviews Button */}
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                title="Socratic Reviews"
                className={`transition-all ${
                  sidebarCollapsed
                    ? `w-12 h-12 rounded-2xl flex items-center justify-center ${
                        activeTab === 'reviews'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-purple-300 hover:bg-slate-800'
                      }`
                    : `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        activeTab === 'reviews'
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4 text-purple-400'} />
                  {!sidebarCollapsed && <span>Socratic Reviews</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>

              {/* Send Parent Report Action Button */}
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                title="Send Report to Parent"
                className={`transition-all ${
                  sidebarCollapsed
                    ? 'w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center shadow-md'
                    : 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className={sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4 text-amber-400'} />
                  {!sidebarCollapsed && <span>Send Parent Report</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>
            </nav>

            {/* Active Class Section Box (Only when expanded) */}
            {!sidebarCollapsed && (
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2 text-xs w-full mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Class Section</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="font-bold text-white text-sm">SEE Science Section A</p>
                <p className="text-[11px] text-slate-400">{students.length} Enrolled Students · Active</p>
              </div>
            )}

          </aside>


          {/* 2. MAIN WORKSPACE CONTAINER (Adapts dynamically to full width when sidebar is collapsed) */}
          <main className="flex-1 min-w-0 space-y-6 w-full">

            {/* TOP HEADER & ACTIONS BAR (Clean, spacious layout with NO overlapping) */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Teacher Supervision Desk
                  </div>
                  <h1 className="font-outfit text-3xl font-extrabold text-white tracking-tight">
                    {activeTab === 'students' ? 'Enrolled Students List' : 'Linked Student Performance & Socratic Signals'}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Send className="w-4 h-4" />
                    Send Parent Report
                  </button>

                  {weekly ? (
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-200 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
                      onClick={() => downloadJson('clariq-teacher-weekly.json', weekly)}
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      Export Signals
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Filter Pills Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                  }`}
                >
                  📊 Class Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeTab === 'students'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80'
                  }`}
                >
                  🎓 Students ({students.length})
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
                  📝 Socratic Reviews
                </button>
              </div>
            </div>


            {/* 3. TOP KPI STAT CARDS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Students */}
              <div
                onClick={() => setActiveTab('students')}
                className="p-5 rounded-3xl border border-amber-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-lg cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">Total Students</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mt-3">{students.length} Enrolled</h3>
                <p className="text-xs text-amber-300 font-semibold mt-1">Click to view student list</p>
              </div>

              {/* Card 2: Confused Nodes */}
              <div className="p-5 rounded-3xl border border-rose-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-rose-500/50 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-400 tracking-wider">Confused Topics</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mt-3">{confused.length} Nodes</h3>
                <p className="text-xs text-rose-300 font-semibold mt-1">Needs Socratic hint</p>
              </div>

              {/* Card 3: Weakest Nodes */}
              <div className="p-5 rounded-3xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider">Weakest Nodes</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mt-3">{weakest.length} Listed</h3>
                <p className="text-xs text-cyan-300 font-semibold mt-1">Below 60% accuracy</p>
              </div>

              {/* Card 4: Parent Reports */}
              <div className="p-5 rounded-3xl border border-emerald-500/30 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">Parent Reports</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-outfit text-2xl font-bold text-white mt-3">2 Sent</h3>
                <p className="text-xs text-emerald-300 font-semibold mt-1">100% Synced to Parent</p>
              </div>

            </div>


            {/* CLASS PERFORMANCE GRAPH COMPONENT */}
            <ClassPerformanceGraph />


            {/* Loading / Error States */}
            {loading ? <p className="text-xs text-slate-400 animate-pulse">Loading student performance report…</p> : null}
            {error ? <p className="text-xs text-rose-300">{error}</p> : null}


            {/* 4. STUDENTS VIEW MODE (When Students tab is selected) */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                
                {/* Total Students Header Banner */}
                <div className="p-5 rounded-3xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between shadow-xl">
                  <div>
                    <h2 className="font-outfit text-2xl font-bold text-white">Total Enrolled Students</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Showing all {students.length} students in Class 10 SEE Science Section A. Click any student to open their detailed information modal.
                    </p>
                  </div>
                  <span className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-mono font-bold">
                    Total: {students.length} Students
                  </span>
                </div>

                {/* Total Students Cards Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleOpenStudentDetail(s.id)}
                      className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer space-y-3 group shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold group-hover:scale-105 transition-transform">
                          {s.name.charAt(0)}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-cyan-300 border border-slate-700">
                          {s.code}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-outfit font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">{s.name}</h3>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Class 10 Science</span>
                        <span className="text-emerald-400 font-semibold font-mono">{s.mastery}% Mastery</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}


            {/* 5. MAIN OVERVIEW VIEW MODE */}
            {activeTab !== 'students' && (
              <div className="grid lg:grid-cols-12 gap-6">

                {/* Left Column (8 cols): Primary Cards & Reports */}
                <div className="lg:col-span-8 space-y-6">

                  {/* Selected Student Profile Banner */}
                  {selectedStudent && (
                    <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-lg">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-semibold uppercase text-cyan-400">Assigned Student Profile</span>
                          <h2 className="font-outfit text-xl font-bold text-white">{selectedStudent.name}</h2>
                          <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleOpenStudentDetail(selectedStudent.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 hover:bg-slate-700 transition-all"
                      >
                        View Info Modal
                      </button>
                    </div>
                  )}

                  {/* TEACHER REVIEW PANEL COMPONENT */}
                  <TeacherReviewPanel student={selectedStudent} confusedNodes={confused} weakestNodes={weakest} />

                  {/* Confused Topics Section */}
                  <section className="space-y-4">
                    <h2 className="font-outfit text-2xl font-bold text-white">Confused Science Topics</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {confused.length === 0 && !loading ? (
                        <p className="text-xs text-slate-400">No confused concept nodes recorded in this window.</p>
                      ) : null}
                      {confused.map((node) => (
                        <MasteryCard key={node.concept_id || node.id} node={node} />
                      ))}
                    </div>
                  </section>

                </div>


                {/* Right Column (4 cols): Students Quick List */}
                <div className="lg:col-span-4 space-y-6">

                  {/* Students Card */}
                  <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        Students
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('students')}
                        className="text-xs font-semibold text-cyan-400 hover:underline"
                      >
                        View All ({students.length})
                      </button>
                    </div>
                    
                    <div className="space-y-2.5">
                      {students.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleOpenStudentDetail(s.id)}
                          className="p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-300 font-bold flex items-center justify-center text-xs group-hover:scale-105 transition-transform">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">{s.name}</p>
                              <p className="text-[10px] text-slate-400">{s.code}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {s.mastery}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weakest Nodes Section */}
                  <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl space-y-4 shadow-xl">
                    <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Weakest Nodes (Priority)
                    </h3>
                    <div className="space-y-3">
                      {weakest.length === 0 && !loading ? (
                        <p className="text-xs text-slate-400">No weakest-node topics listed yet.</p>
                      ) : null}
                      {weakest.slice(0, 3).map((node) => (
                        <MasteryCard key={node.concept_id || node.id} node={node} />
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </main>

        </div>

        {/* STUDENT INFORMATION & PROGRESS DETAIL MODAL */}
        <StudentDetailModal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          student={selectedStudent}
          weekly={weekly}
          onOpenSendReport={(st) => {
            setTargetStudentForReport(st);
            setReportModalOpen(true);
          }}
        />

        {/* SEND PARENT REPORT MODAL */}
        <SendParentReportModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setTargetStudentForReport(null);
          }}
        />
      </div>
    </TeacherLayout>
  );
}
