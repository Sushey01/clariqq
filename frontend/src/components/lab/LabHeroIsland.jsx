import { lazy, Suspense, useEffect, useState } from 'react';
import { shouldUseLab3D } from '@/lib/labVisual';
import LabHeroFallback from '@/components/lab/LabHeroFallback';

const LabHeroScene = lazy(() => import('@/components/lab/LabHeroScene'));

export default function LabHeroIsland() {
  const [enable3d, setEnable3d] = useState(false);

  useEffect(() => {
    setEnable3d(shouldUseLab3D());
  }, []);

  if (!enable3d) {
    return <LabHeroFallback />;
  }

  return (
    <Suspense fallback={<LabHeroFallback />}>
      <LabHeroScene />
    </Suspense>
  );
}
