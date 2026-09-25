import { Link } from 'react-router-dom';
import { PROGRAMS } from '@/content/site';

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-raised)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-outfit text-lg font-semibold">Clariq</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--ink-muted)]">
            A cinematic front door for a serious Socratic tutor. Grade 10 science for Nepal — one
            question at a time, not a homework dump.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">About</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
            <li>
              <Link to="/about" className="hover:text-[var(--ink)]">
                About us
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-[var(--ink)]">
                How it works
              </Link>
            </li>
            <li>
              <Link to="/stories" className="hover:text-[var(--ink)]">
                Stories
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-[var(--ink)]">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
            {PROGRAMS.map((program) => (
              <li key={program.slug}>
                <Link to={`/subjects/${program.slug}`} className="hover:text-[var(--ink)]">
                  {program.subject}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/demo" className="hover:text-[var(--ink)]">
                Start a session
              </Link>
            </li>
            <li>
              <Link to="/for-students" className="hover:text-[var(--ink)]">
                For students
              </Link>
            </li>
            <li>
              <Link to="/for-teachers" className="hover:text-[var(--ink)]">
                For teachers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
            <li>
              <Link to="/login" className="hover:text-[var(--ink)]">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-[var(--ink)]">
                Sign up
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-sm leading-relaxed text-[var(--ink-muted)]">
            We will not paste the textbook. After a question, the next move is yours.
          </p>
        </div>
      </div>
    </footer>
  );
}
