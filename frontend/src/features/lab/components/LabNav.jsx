import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FlaskConical, UserCheck, ChevronDown, Check, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { userRole } from '@/auth/roles';
import ThemeToggle from '@/components/theme/ThemeToggle';
import SystemFeedbackModal from '@/components/feedback/SystemFeedbackModal';
import StudentNotebookModal from '@/features/notebook/components/StudentNotebookModal';
import '@/features/lab/styles/lab.css';

export default function LabNav() {
  const { user, loginDemo, logout } = useAuth();
  const role = userRole(user);
  const chatTo = user ? '/app/chat' : '/demo';
  const navigate = useNavigate();
  const location = useLocation();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);

  // Check if current page is Login or Signup
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Guests (not logged in and not on login page) can switch demo personas
  const isGuest = !user && !isAuthPage;

  const handleSwitchRole = async (targetRole) => {
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
    await loginDemo(targetRole);
    if (targetRole === 'student') navigate('/app');
    else if (targetRole === 'teacher') navigate('/teacher');
    else if (targetRole === 'parent') navigate('/parent');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
      isActive
        ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-xs'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 py-3 sm:px-6 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group text-decoration-none">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-400/60 transition-all shadow-sm">
            <FlaskConical className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="font-outfit font-bold text-lg bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent tracking-tight">
            Clariq
          </span>
        </Link>

        {/* Center Desktop Navigation Links (Only shown when signed in) */}
        {!isAuthPage && user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/70 p-1 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
            
            {/* TEACHER ROLE NAVBAR */}
            {user && role === 'teacher' ? (
              <>
                <NavLink to="/teacher" end className={navLinkClass}>
                  Teacher Desk
                </NavLink>
                <NavLink to="/app/progress" className={navLinkClass}>
                  Student Signals
                </NavLink>
                <NavLink to="/app/chat" className={navLinkClass}>
                  Teacher Chat
                </NavLink>
                <NavLink to="/subjects" className={navLinkClass}>
                  Subjects
                </NavLink>
                <NavLink to="/study" className={navLinkClass}>
                  Study Test
                </NavLink>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  Feedback
                </button>
              </>
            ) : /* PARENT ROLE NAVBAR (No direct chatbot, includes Reviews & Reports) */
            user && role === 'parent' ? (
              <>
                <NavLink to="/parent" end className={navLinkClass}>
                  Parent Desk
                </NavLink>
                <NavLink to="/app/progress" className={navLinkClass}>
                  Child Signals
                </NavLink>
                <a href="/parent#reviews" className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
                  Weekly Reviews
                </a>
                <a href="/parent#reports" className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
                  Teacher Reports
                </a>
                <NavLink to="/subjects" className={navLinkClass}>
                  Subjects
                </NavLink>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  Feedback
                </button>
              </>
            ) : /* STUDENT ROLE NAVBAR */
            user && role === 'student' ? (
              <>
                <NavLink to="/app" end className={navLinkClass}>
                  Student Hub
                </NavLink>
                <NavLink to="/app/chat" className={navLinkClass}>
                  Student Chat
                </NavLink>
                <button
                  type="button"
                  onClick={() => setNotebookOpen(true)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    notebookOpen
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  📓 Notebook
                </button>
                <NavLink to="/app/progress" className={navLinkClass}>
                  Progress Signals
                </NavLink>
                <NavLink to="/subjects" className={navLinkClass}>
                  Subjects
                </NavLink>
                <NavLink to="/study" className={navLinkClass}>
                  Study Test
                </NavLink>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  Feedback
                </button>
              </>
            ) : /* GUEST / DEMO VISITOR NAVBAR */ (
              <>
                <a href="/#benches" className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
                  Lab
                </a>
                <NavLink to="/demo" className={navLinkClass}>
                  Chat
                </NavLink>
                <a href="/#signals" className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all">
                  Progress
                </a>
                <NavLink to="/subjects" className={navLinkClass}>
                  Subjects
                </NavLink>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
                >
                  Feedback
                </button>
              </>
            )}

          </nav>
        )}

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">

          {/* Authenticated Role Badge */}
          {user && !isAuthPage && (
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-700/80 bg-slate-900/60 text-xs font-semibold text-slate-300">
              {role === 'teacher' ? '👩‍🏫 Teacher' : role === 'parent' ? '👨‍👩‍👧 Parent' : '🎓 Student'}
            </span>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Logged in controls vs Auth Page Links */}
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-700/80 hover:border-red-500/40 bg-slate-900/60 hover:bg-red-500/10 text-xs font-semibold text-slate-200 hover:text-red-300 transition-all shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          ) : !isAuthPage ? (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-700/80 hover:border-cyan-500/50 bg-slate-900/70 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-xs"
            >
              Sign in
            </Link>
          ) : location.pathname === '/login' ? (
            <Link
              to="/signup"
              className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold text-cyan-300 transition-all shadow-xs"
            >
              Sign up
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-700/80 hover:border-cyan-500/50 bg-slate-900/70 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-xs"
            >
              Sign in
            </Link>
          )}

          {/* Role Primary Action Button (Hidden on Auth Pages) */}
          {!isAuthPage && (
            <Link
              to={role === 'teacher' ? '/teacher' : role === 'parent' ? '/parent' : user ? '/app' : '/study'}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              {role === 'teacher' ? 'Teacher Desk' : role === 'parent' ? 'Parent Desk' : user ? 'Student Hub' : 'Study Test'}
            </Link>
          )}

          {/* Mobile Menu Toggle (Hidden on Auth Pages) */}
          {!isAuthPage && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

        </div>
      </div>
      <SystemFeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <StudentNotebookModal isOpen={notebookOpen} onClose={() => setNotebookOpen(false)} />
    </header>
  );
}
