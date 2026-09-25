export default function LabHeroFallback() {
  return (
    <div className="relative flex h-full min-h-[18rem] items-center justify-center overflow-hidden" aria-hidden="true">
      <span className="lab-orb-cyan pointer-events-none absolute -left-10 top-6 h-40 w-40 rounded-full" />
      <span className="lab-orb-orange pointer-events-none absolute -right-8 bottom-4 h-48 w-48 rounded-full" />
      <div className="css-atom">
        <span className="css-atom-core" />
        <span className="css-atom-ring" />
        <span className="css-atom-ring" />
        <span className="css-atom-ring" />
      </div>
    </div>
  );
}
