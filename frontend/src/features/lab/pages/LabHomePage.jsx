import LabLayout from '@/features/lab/components/LabLayout';
import LabHero from '@/features/lab/components/LabHero';
import LabBenches from '@/features/lab/components/LabBenches';
import LabTutorDesk from '@/features/lab/components/LabTutorDesk';
import LabSignals from '@/features/lab/components/LabSignals';
import LabFooterCta from '@/features/lab/components/LabFooterCta';

export default function LabHomePage() {
  return (
    <LabLayout>
      <LabHero />
      <LabBenches />
      <LabTutorDesk />
      <LabSignals />
      <LabFooterCta />
    </LabLayout>
  );
}
