import { useState, useEffect } from 'react';
import { Award, CheckCircle, FileText, Sparkles } from 'lucide-react';

const REVIEWS_STORAGE_KEY = 'clariq_teacher_reviews_v1';

export default function TeacherReportsCard({ child }) {
  const [teacherReviews, setTeacherReviews] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        setTeacherReviews(JSON.parse(saved));
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit text-xl font-bold text-white">Direct Teacher Evaluation Reports</h3>
            <p className="text-xs text-slate-400">
              Official progress feedback and review notes sent directly from {child?.name || 'your child'}'s science teacher.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
          Teacher Reports Channel
        </span>
      </div>

      {teacherReviews.length > 0 ? (
        <div className="space-y-3">
          {teacherReviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {rev.concept}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{rev.note}"
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-400">Report Status: Official Evaluation</span>
                <span className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                  rev.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  rev.status === 'practice' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {rev.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/50 text-xs text-slate-400 leading-relaxed">
          No official teacher report entries saved yet. When the science teacher submits progress review notes from the Teacher Desk, they will appear here automatically.
        </div>
      )}
    </div>
  );
}
