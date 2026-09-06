import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Sparkles } from 'lucide-react';

export default function TryDemoButton() {
  const root = useRef(null);

  useGSAP(
    () => {
      const node = root.current?.querySelector('.try-demo-btn');
      if (!node) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const glow = gsap.timeline({ repeat: -1, repeatDelay: 4.5, delay: 0.8 });
      glow
        .to(node, {
          boxShadow: '0 0 0 1px rgba(165,180,252,0.7), 0 0 28px 4px rgba(99,102,241,0.45)',
          scale: 1.03,
          duration: 0.85,
          ease: 'sine.inOut',
        })
        .to(node, {
          boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 0 0 0 rgba(99,102,241,0)',
          scale: 1,
          duration: 0.85,
          ease: 'sine.inOut',
        })
        .to(node, {
          boxShadow: '0 0 0 1px rgba(165,180,252,0.7), 0 0 28px 4px rgba(99,102,241,0.45)',
          scale: 1.03,
          duration: 0.85,
          ease: 'sine.inOut',
        })
        .to(node, {
          boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 0 0 0 rgba(99,102,241,0)',
          scale: 1,
          duration: 0.85,
          ease: 'sine.inOut',
        });
    },
    { scope: root }
  );

  return (
    <span ref={root} className="inline-flex">
      <Link
        to="/demo"
        className="try-demo-btn inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white px-5 py-2.5 text-sm font-semibold text-black"
      >
        <Sparkles className="h-4 w-4" />
        Try a Socratic chat
      </Link>
    </span>
  );
}
