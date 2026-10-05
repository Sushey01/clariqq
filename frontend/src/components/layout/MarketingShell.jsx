import LabNav from '@/features/lab/components/LabNav';
import SiteFooter from '@/components/layout/SiteFooter';

export default function MarketingShell({ children }) {
  return (
    <div data-lab="cinematic" className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink)]">
      <LabNav />
      {children}
      <SiteFooter />
    </div>
  );
}
