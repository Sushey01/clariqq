import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import AmbientField from './AmbientField';
import TryDemoButton from './TryDemoButton';

export default function AuthLayout({ eyebrow, title, children }) {
  const panel = useRef(null);

  useGSAP(
    () => {
      gsap.from('.brand-copy', {
        x: -24,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
      });
    },
    { scope: panel }
  );

  return (
    <div className="relative min-h-screen bg-[#0f0f0f] text-zinc-100">
      <AmbientField />
      <div
        ref={panel}
        className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2"
      >
        <section className="hidden flex-col justify-between p-12 lg:flex">
          <Link to="/login" className="font-outfit text-lg font-semibold tracking-tight">
            Clariq
          </Link>
          <div className="brand-copy max-w-md space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
              Grade 10 science tutor
            </p>
            <h1 className="font-outfit text-4xl font-semibold leading-tight text-white">
              Ask. Think. Arrive at the answer yourself.
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              Clariq guides with Socratic questions instead of dumping solutions.
              Sign in to keep your chats on this device.
            </p>
            <div className="pt-2">
              <TryDemoButton />
              <p className="mt-2 text-xs text-zinc-500">
                One free question. No account needed.
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-600">Socratic RAG tutor</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171717]/80 p-8 backdrop-blur-md">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-outfit text-2xl font-semibold text-white">{title}</h2>
            <div className="mt-8">{children}</div>
            <div className="mt-6 flex flex-col items-center gap-2 lg:hidden">
              <TryDemoButton />
              <p className="text-xs text-zinc-500">One free question. No account needed.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
