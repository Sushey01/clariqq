import { Link } from 'react-router-dom';

export default function DemoLimitCard() {
  return (
    <div className="mx-auto mb-3 w-full max-w-3xl rounded-2xl border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[var(--bg-raised)] px-4 py-3 text-center">
      <p className="text-sm text-[var(--ink)]">
        That was your free Socratic thread. Create an account to keep learning.
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <Link
          to="/signup"
          className="rounded-full bg-[var(--ink)] px-4 py-1.5 text-xs font-semibold text-[var(--bg-canvas)]"
        >
          Create account
        </Link>
        <Link
          to="/login"
          className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--ink)]"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
