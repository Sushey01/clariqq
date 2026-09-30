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
  return isActive ? 'text-[var(--accent)]' : 'hover:text-[var(--accent)]';
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="lab-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="font-outfit text-lg font-semibold tracking-tight">
          Clariq
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--ink)] lg:flex">
          {LINKS.map((link) =>
            link.to.startsWith('/#') ? (
              <Link key={link.to} to={link.to} className="hover:text-[var(--accent)]">
                {link.label}
              </Link>
            ) : (
              <NavLink key={link.to} to={link.to} className={navClass}>
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="hidden text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] sm:inline">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[#041018]"
          >
            Sign up
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium">
            {LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
