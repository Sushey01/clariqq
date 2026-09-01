import { Link } from 'react-router-dom';

export default function DemoLimitCard() {
  return (
    <div className="mx-auto mb-3 w-full max-w-3xl rounded-2xl border border-indigo-400/30 bg-[#171717] px-4 py-3 text-center">
      <p className="text-sm text-zinc-200">
        That was your free question. Create an account to keep the conversation going.
      </p>
      <div className="mt-3 flex justify-center gap-2">
        <Link
          to="/signup"
          className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black"
        >
          Create account
        </Link>
        <Link
          to="/login"
          className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-zinc-200"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
