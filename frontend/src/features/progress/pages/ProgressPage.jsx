import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProgressGraph, getWeeklyReport } from '@/api/client';
import LabLayout from '@/features/lab/components/LabLayout';
import ActivityHeatmap from '@/features/progress/components/ActivityHeatmap';
import ConceptMasteryMap from '@/features/progress/components/ConceptMasteryMap';
import ConceptGraphVisualizer from '@/features/progress/components/ConceptGraphVisualizer';
import useProgressActivity from '@/features/progress/hooks/useProgressActivity';
import { downloadJson } from '@/features/progress/lib/mastery';

const MOCK_FALLBACK_NODES = [
  { id: 'p1', title: "Newton's First Law", subject: 'Physics', seen: true, accuracy: 0.9, confused: false, turn_count: 12 },
  { id: 'p2', title: "Refraction of Light", subject: 'Physics', seen: true, accuracy: 0.85, confused: false, turn_count: 8 },
  { id: 'p3', title: "Ohm's Law & Circuits", subject: 'Physics', seen: true, accuracy: 0.45, confused: true, turn_count: 6 },
  { id: 'c1', title: "Balancing Chemical Equations", subject: 'Chemistry', seen: true, accuracy: 0.92, confused: false, turn_count: 14 },
  { id: 'c2', title: "Atomic Structure & Isotopes", subject: 'Chemistry', seen: true, accuracy: 0.78, confused: false, turn_count: 5 },
  { id: 'c3', title: "Stoichiometry & Moles", subject: 'Chemistry', seen: false, accuracy: 0.35, confused: true, turn_count: 3 },
  { id: 'b1', title: "DNA & RNA Transcription", subject: 'Biology', seen: true, accuracy: 0.88, confused: false, turn_count: 10 },
  { id: 'b2', title: "Photosynthesis & Chloroplasts", subject: 'Biology', seen: true, accuracy: 0.82, confused: false, turn_count: 7 },
  { id: 'e1', title: "Water Cycle & Evaporation", subject: 'Earth', seen: true, accuracy: 0.95, confused: false, turn_count: 16 },
  { id: 'e2', title: "Earth Tilt & Seasonal Variation", subject: 'Earth', seen: true, accuracy: 0.60, confused: false, turn_count: 4 },
];

export default function ProgressPage() {
  const [graph, setGraph] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('graph');
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

  const nodes = (graph && graph.nodes && graph.nodes.length > 0) ? graph.nodes : MOCK_FALLBACK_NODES;

  return (
    <LabLayout>
      <section className="nebular-section">
        <div className="nebular-wrap">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--n-cyan)]">
            Student progress & mastery
          </p>
          <h1 className="mt-2 font-outfit text-4xl font-semibold">Interactive Concept Mastery Map</h1>
          <p className="mt-3 max-w-xl text-sm" style={{ color: 'var(--n-muted)' }}>
            Track your Grade 10 Science concept mastery across Physics, Chemistry, Biology, and Earth Science. Click any concept node to inspect metrics or launch instant Socratic practice.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/app/chat" className="nebular-cta">
              Open Socratic Desk
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

          {/* Activity Heatmap */}
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

          {loading ? <p className="mt-8 text-sm text-[var(--n-muted)]">Loading mastery graph…</p> : null}

          {/* View Mode Toggle */}
          <div className="mt-8 flex items-center justify-between pb-3 border-b border-[var(--n-border)]">
            <h2 className="text-xl font-outfit font-semibold text-white">
              {viewMode === 'graph' ? 'SEE Curriculum Concept Graph' : 'Concept Mastery Matrix'}
            </h2>
            <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-[var(--n-border)]">
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === 'graph'
                    ? 'bg-[var(--n-cyan)] text-black font-semibold'
                    : 'text-[var(--n-muted)] hover:text-white'
                }`}
              >
                Graph Network (135 Nodes)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === 'matrix'
                    ? 'bg-[var(--n-cyan)] text-black font-semibold'
                    : 'text-[var(--n-muted)] hover:text-white'
                }`}
              >
                Mastery Cards
              </button>
            </div>
          </div>

          {/* Render selected view */}
          <div className="mt-6">
            {viewMode === 'graph' ? (
              <ConceptGraphVisualizer
                graphNodes={nodes}
                graphEdges={graph?.edges || []}
              />
            ) : (
              <ConceptMasteryMap nodes={nodes} />
            )}
          </div>

        </div>
      </section>
    </LabLayout>
  );
}
