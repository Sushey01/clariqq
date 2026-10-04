import Modal from '@/components/ui/Modal';
import MasteryCard from '@/features/progress/components/MasteryCard';
import {
  User,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Award,
  Flame,
  BarChart3,
  TrendingUp,
  Mail,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function StudentDetailModal({ isOpen, onClose, student, weekly, onOpenSendReport }) {
  if (!student) return null;

  const confused = weekly?.confused || [
    { concept_id: 'c-1', name: 'Archimedes Principle & Upthrust', subject: 'Physics', accuracy: 45 },
    { concept_id: 'c-2', name: 'Modern Periodic Law Anomalies', subject: 'Chemistry', accuracy: 52 },
  ];

  const weakest = weekly?.weakest || [
    { concept_id: 'w-1', name: 'Refraction through Lenses', subject: 'Physics', accuracy: 58 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.name}'s Student Information Card`}
      icon={GraduationCap}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        
        {/* Student Profile Header Banner */}
        <div className="p-6 rounded-3xl border border-cyan-500/30 bg-slate-900/90 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold font-outfit text-2xl shadow-md">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300">
                  GRADE 10 SEE SCIENCE
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ENROLLED & ACTIVE
                </span>
              </div>
              <h2 className="font-outfit text-2xl font-bold text-white mt-1">{student.name}</h2>
              <p className="text-xs text-slate-400">{student.email || 'student@clariq.edu'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenSendReport) onOpenSendReport(student);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            Send Report to Parent
          </button>
        </div>

        {/* 4 Stat Summary Cards for this Student */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-slate-950/70">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-400">Concept Mastery</span>
            <p className="text-xl font-bold text-white mt-1 font-outfit">78%</p>
            <p className="text-[10px] text-slate-400">Above Class Avg</p>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-slate-950/70">
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Test Score Gain</span>
            <p className="text-xl font-bold text-emerald-300 mt-1 font-outfit">+24%</p>
            <p className="text-[10px] text-slate-400">Pre/Post Test Gain</p>
          </div>

          <div className="p-4 rounded-2xl border border-cyan-500/30 bg-slate-950/70">
            <span className="text-[10px] uppercase font-mono font-bold text-cyan-400">Socratic Turns</span>
            <p className="text-xl font-bold text-white mt-1 font-outfit">42 Turns</p>
            <p className="text-[10px] text-slate-400">This Month</p>
          </div>

          <div className="p-4 rounded-2xl border border-purple-500/30 bg-slate-950/70">
            <span className="text-[10px] uppercase font-mono font-bold text-purple-400">Active Streak</span>
            <p className="text-xl font-bold text-white mt-1 font-outfit">5 Days</p>
            <p className="text-[10px] text-slate-400">Current Streak</p>
          </div>
        </div>

        {/* Linked Parent & Account Details */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Student Link Code</span>
            <p className="text-sm font-mono font-bold text-cyan-300">{student.code || 'STU-9482'}</p>
            <p className="text-[11px] text-slate-400">Used for parent supervision linking</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Linked Parent Contact</span>
            <p className="text-sm font-bold text-white">{student.parentEmail || 'parent@clariq.edu'}</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct Report Dispatch Synced
            </p>
          </div>
        </div>

        {/* Confused Science Topics Section */}
        <div className="space-y-3">
          <h4 className="font-outfit font-bold text-lg text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Confused Science Topics for {student.name}
          </h4>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {confused.length === 0 ? (
              <p className="text-xs text-slate-400">No confused concept nodes recorded for this student.</p>
            ) : (
              confused.map((node) => (
                <MasteryCard key={node.concept_id || node.id} node={node} />
              ))
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
}
