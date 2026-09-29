import { useEffect, useState } from 'react';
import { getParentChild, getParentChildWeekly } from '@/api/client';
import ParentLayout from '@/features/parent/components/ParentLayout';
import MasteryCard from '@/features/progress/components/MasteryCard';

export default function ParentDashboardPage() {
  const [child, setChild] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getParentChild(), getParentChildWeekly()])
      .then(([childData, weeklyData]) => {
        if (cancelled) return;
        setChild(childData);
        setWeekly(weeklyData);
      })
      .catch((exc) => {
        if (!cancelled) setError(exc.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const confused = weekly?.confused || [];
  const weakest = weekly?.weakest || [];
  const practice = confused[0] || weakest[0];

  return (
    <ParentLayout>
      <section className="nebular-section">
        <div className="nebular-wrap">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--n-cyan)]">
            Parent desk
          </p>
          <h1 className="mt-2 font-outfit text-4xl font-semibold">This week</h1>
          <p className="mt-3 max-w-2xl text-sm" style={{ color: 'var(--n-muted)' }}>
            A plain-language look at how {child?.name || 'your child'} is doing in Grade 10 science.
            This is not a gradebook.
          </p>

          {loading ? <p className="mt-8 text-sm text-[var(--n-muted)]">Loading…</p> : null}
          {error ? <p className="mt-8 text-sm text-rose-300">{error}</p> : null}

          {practice ? (
            <div className="nebular-card mt-8 p-5">
              <p className="text-[11px] uppercase tracking-wide text-[var(--n-faint)]">
                Practice this next
              </p>
              <p className="mt-2 font-outfit text-xl">{practice.name}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--n-muted)' }}>
                Ask them to explain this idea in their own words at the Clariq desk, one question at
                a time.
              </p>
            </div>
          ) : !loading && !error ? (
            <p className="mt-8 text-sm" style={{ color: 'var(--n-muted)' }}>
              No stuck topics this week. Keep a short science conversation going when you can.
            </p>
          ) : null}

          <h2 className="mt-10 font-outfit text-2xl">Where they got stuck</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--n-muted)' }}>
            Topics with three low-confidence turns in a row.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {confused.length === 0 && !loading ? (
              <p className="text-sm" style={{ color: 'var(--n-muted)' }}>
                Nothing marked confused this week.
              </p>
            ) : null}
            {confused.map((node) => (
              <MasteryCard key={node.concept_id || node.id} node={node} />
            ))}
          </div>
        </div>
      </section>
    </ParentLayout>
  );
}
