import '@/nebular/nebular.css';
import NebularNav from '@/nebular/NebularNav';
import NebularHero from '@/nebular/NebularHero';
import NebularBenches from '@/nebular/NebularBenches';
import NebularTutorDesk from '@/nebular/NebularTutorDesk';
import NebularSignals from '@/nebular/NebularSignals';
import NebularFooterCta from '@/nebular/NebularFooterCta';

export default function NebularHome() {
  return (
    <div className="nebular">
      <NebularNav />
      <NebularHero />
      <NebularBenches />
      <NebularTutorDesk />
      <NebularSignals />
      <NebularFooterCta />
    </div>
  );
}
