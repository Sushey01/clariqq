import { lazy, Suspense, useEffect, useState } from 'react';
import { shouldUseLab3D } from '@/lib/labVisual';
import LabHeroFallback from '@/features/lab/components/LabHeroFallback';

const LabHeroScene = lazy(() => import('@/features/lab/components/LabHeroScene'));

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
      <div className="nebular-stage">
        <LabHeroScene />
      </div>
    </Suspense>
  );
}
