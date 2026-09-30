import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProgressGraph, getWeeklyReport } from '@/api/client';
import LabLayout from '@/features/lab/components/LabLayout';
import ActivityHeatmap from '@/features/progress/components/ActivityHeatmap';
import MasteryCard from '@/features/progress/components/MasteryCard';
import useProgressActivity from '@/features/progress/hooks/useProgressActivity';
import { downloadJson } from '@/features/progress/lib/mastery';

const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Biology'];

export default function ProgressPage() {
  const [graph, setGraph] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [subject, setSubject] = useState('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const activity = useProgressActivity();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getProgressGraph(), getWeeklyReport()])
      .then(([graphData, weeklyData]) => {
        if (cancelled) return;
        setGraph(graphData);
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

  const nodes = useMemo(() => {
    const list = graph?.nodes || [];
    if (subject === 'All') return list;
    return list.filter((node) => node.subject === subject);
  }, [graph, subject]);

  const seen = nodes.filter((node) => node.seen);
  const confused = nodes.filter((node) => node.confused);

  return (
    <LabLayout>
      <section className="nebular-section">
        <div className="nebular-wrap">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--n-cyan)]">
            Student progress
          </p>
          <h1 className="mt-2 font-outfit text-4xl font-semibold">Knowledge pulse</h1>
          <p className="mt-3 max-w-xl text-sm" style={{ color: 'var(--n-muted)' }}>
            Physics, chemistry, and biology nodes from the SEE graph. Empty is normal until you take
            signed-in science turns at the desk.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/app/chat" className="nebular-cta">
              Open the desk
            </Link>
            {weekly ? (
              <button
                type="button"
                className="nebular-ghost"
                onClick={() => downloadJson('clariq-weekly-report.json', weekly)}
              >
                Download weekly JSON
              </button>
            ) : null}
          </div>

          {activity ? (
            <div className="nebular-card mt-8 p-5">
              <ActivityHeatmap
                days={activity.days}
                currentStreak={activity.current_streak}
                longestStreak={activity.longest_streak}
                activeDays={activity.active_days}
              />
            </div>
          ) : null}

          {loading ? <p className="mt-8 text-sm text-[var(--n-muted)]">Loading graph…</p> : null}
          {error ? (
            <p className="mt-8 text-sm text-rose-300">
              {error}. Sign in and start the API to load mastery.
            </p>
          ) : null}

          {graph ? (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="nebular-card p-4">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--n-faint)]">Catalog</p>
                  <p className="mt-1 font-outfit text-2xl">
                    {graph.counts?.nodes ?? nodes.length}
                  </p>
                </div>
                <div className="nebular-card p-4">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--n-faint)]">Touched</p>
                  <p className="mt-1 font-outfit text-2xl">{seen.length}</p>
                </div>
                <div className="nebular-card p-4">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--n-faint)]">Confused</p>
                  <p className="mt-1 font-outfit text-2xl">{confused.length}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {SUBJECTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSubject(item)}
                    className={item === subject ? 'nebular-cta' : 'nebular-ghost'}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {nodes
                  .filter((node) => node.seen || subject !== 'All')
                  .slice(0, subject === 'All' ? 60 : 200)
                  .map((node) => (
                    <MasteryCard key={node.id} node={node} />
                  ))}
              </div>
              {subject === 'All' && seen.length === 0 ? (
                <p className="mt-6 text-sm" style={{ color: 'var(--n-muted)' }}>
                  No nodes touched yet. Ask a Grade 10 science question while signed in.
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </section>
    </LabLayout>
  );
}
