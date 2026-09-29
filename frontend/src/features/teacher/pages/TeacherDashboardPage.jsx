import { useEffect, useState } from 'react';
import { getTeacherStudents, getTeacherStudentWeekly } from '@/api/client';
import TeacherLayout from '@/features/teacher/components/TeacherLayout';
import MasteryCard from '@/features/progress/components/MasteryCard';
import { downloadJson } from '@/features/progress/lib/mastery';

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const student = students[0];

  useEffect(() => {
    let cancelled = false;
    getTeacherStudents()
      .then(async (list) => {
        if (cancelled) return;
        setStudents(list);
        if (!list[0]) {
          setWeekly(null);
          return;
        }
        const report = await getTeacherStudentWeekly(list[0].id);
        if (!cancelled) setWeekly(report);
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

  return (
    <TeacherLayout>
      <section className="nebular-section">
        <div className="nebular-wrap">
          <p className="teacher-kicker text-xs font-semibold uppercase tracking-[0.2em]">
            Teacher desk
          </p>
          <h1 className="mt-2 font-outfit text-4xl font-semibold">Linked student</h1>
          <p className="mt-3 max-w-2xl text-sm" style={{ color: 'var(--n-muted)' }}>
            Weekly signals for students linked to this teacher account. This dummy desk has one
            student. No class periods or school roster.
          </p>
          {student ? (
            <p className="mt-4 font-outfit text-xl">
              {student.name}
              <span className="ml-2 text-sm font-normal text-[var(--n-faint)]">{student.email}</span>
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-2">
            {weekly ? (
              <button
                type="button"
                className="nebular-cta"
                onClick={() => downloadJson('clariq-teacher-weekly.json', weekly)}
              >
                Download weekly JSON
              </button>
            ) : null}
          </div>

          {loading ? <p className="mt-8 text-sm text-[var(--n-muted)]">Loading report…</p> : null}
          {error ? <p className="mt-8 text-sm text-rose-300">{error}</p> : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="nebular-card p-4">
              <p className="text-[11px] uppercase tracking-wide text-[var(--n-faint)]">Confused</p>
              <p className="mt-1 font-outfit text-2xl">{confused.length}</p>
            </div>
            <div className="nebular-card p-4">
              <p className="text-[11px] uppercase tracking-wide text-[var(--n-faint)]">Weakest listed</p>
              <p className="mt-1 font-outfit text-2xl">{weakest.length}</p>
            </div>
          </div>

          {weekly ? (
            <p className="mt-4 text-xs text-[var(--n-faint)]">
              Window {weekly.window_days ?? 7} days · {weekly.event_count ?? 0} events
              {weekly.mean_st != null ? ` · mean st ${Number(weekly.mean_st).toFixed(2)}` : ''}
            </p>
          ) : null}

          <h2 className="mt-10 font-outfit text-2xl">Confused topics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {confused.length === 0 && !loading ? (
              <p className="text-sm" style={{ color: 'var(--n-muted)' }}>
                No confused nodes in this window.
              </p>
            ) : null}
            {confused.map((node) => (
              <MasteryCard key={node.concept_id || node.id} node={node} />
            ))}
          </div>

          <h2 className="mt-10 font-outfit text-2xl">Weakest nodes</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {weakest.length === 0 && !loading ? (
              <p className="text-sm" style={{ color: 'var(--n-muted)' }}>
                No weakest-node list yet.
              </p>
            ) : null}
            {weakest.map((node) => (
              <MasteryCard key={node.concept_id || node.id} node={node} />
            ))}
          </div>
        </div>
      </section>
    </TeacherLayout>
  );
}
