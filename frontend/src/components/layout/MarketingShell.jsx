import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export default function MarketingShell({ children }) {
  return (
    <div data-lab="cinematic" className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink)]">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
