import { Link, NavLink } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { userRole } from '@/auth/roles';
import ThemeToggle from '@/components/theme/ThemeToggle';
import '@/features/lab/styles/lab.css';

export default function LabNav() {
  const { user } = useAuth();
  const role = userRole(user);
  const chatTo = user ? '/app/chat' : '/demo';

  return (
    <header className="nebular-nav">
      <Link to="/" className="nebular-brand">
        <span className="nebular-brand-mark">
          <FlaskConical size={16} />
        </span>
        Clariq
      </Link>
      <nav className="nebular-links">
        <a href="/#benches">Lab</a>
        {!user || role === 'student' ? (
          <NavLink to={chatTo} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            Chat
          </NavLink>
        ) : null}
        {user && role === 'student' ? (
          <NavLink
            to="/app/progress"
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
          >
            Progress
          </NavLink>
        ) : null}
        {!user ? <a href="/#signals">Progress</a> : null}
        {user && role === 'teacher' ? (
          <NavLink to="/teacher" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            Teacher
          </NavLink>
        ) : null}
        {user && role === 'parent' ? (
          <NavLink to="/parent" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
            Parent
          </NavLink>
        ) : null}
      </nav>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {!user ? (
          <Link to="/login" className="hidden text-sm text-[var(--n-muted)] hover:text-[var(--n-ink)] sm:inline">
            Sign in
          </Link>
        ) : null}
        <Link to="/preview" className="nebular-preview-btn">
          Preview
        </Link>
        {!user ? (
          <Link
            to="/signup"
            className="rounded-full bg-[var(--n-cyan)] px-3 py-1.5 text-xs font-semibold text-[#041018]"
          >
            Sign up
          </Link>
        ) : null}
      </div>
    </header>
  );
}
