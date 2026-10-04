import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

const LINKS = [
  { to: '/#benches', label: 'Lab' },
  { to: '/demo', label: 'Tutor' },
  { to: '/#signals', label: 'Progress' },
  { to: '/#tutor-preview', label: 'Preview' },
];

function navClass({ isActive }) {
  return isActive ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--accent)] transition-colors';
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="lab-header sticky top-0 z-40 select-none backdrop-blur-md border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="font-outfit text-lg font-semibold tracking-tight text-[var(--ink)]">
          Clariq
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--ink)] lg:flex">
          {LINKS.map((link) =>
            link.to.startsWith('/#') ? (
              <Link key={link.to} to={link.to} className="hover:text-[var(--accent)] transition-colors">
                {link.label}
              </Link>
            ) : (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        {/* Auth Buttons with proper padding & hover states */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Link 
            to="/login" 
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full border border-white/15 text-xs font-semibold text-[var(--ink)] hover:bg-zinc-800 hover:border-white/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Sign in
          </Link>
          
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Sign up
          </Link>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] lg:hidden text-[var(--ink)] hover:bg-zinc-800"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open ? (
        <div className="border-t border-[var(--border)] px-5 py-4 lg:hidden bg-[var(--bg-sidebar)]">
          <div className="flex flex-col gap-3 text-sm font-medium">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="py-1">
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-full border border-white/15 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-full bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
