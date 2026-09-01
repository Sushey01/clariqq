import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export default function AmbientField() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.to('.orb-a', {
        x: 50,
        y: -40,
        duration: 9,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to('.orb-b', {
        x: -60,
        y: 30,
        duration: 11,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to('.orb-c', {
        x: 30,
        y: 50,
        duration: 13,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="orb-a absolute -left-16 top-16 h-64 w-64 rounded-full bg-indigo-600/25 blur-3xl" />
      <div className="orb-b absolute -right-10 top-40 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="orb-c absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-sky-500/15 blur-3xl" />
    </div>
  );
}
