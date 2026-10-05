import { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertTriangle, Sparkles, MessageSquare, Award, FileText, BookOpen } from 'lucide-react';

const REVIEWS_STORAGE_KEY = 'clariq_teacher_reviews_v1';
const TEACHER_REQUESTS_KEY = 'clariq_parent_teacher_requests_v1';

export default function TeacherReviewPanel({ student, confusedNodes = [], weakestNodes = [] }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [parentRequests, setParentRequests] = useState([]);

  useEffect(() => {
    try {
      const savedReqs = localStorage.getItem(TEACHER_REQUESTS_KEY);
      if (savedReqs) setParentRequests(JSON.parse(savedReqs));
    } catch {
      /* ignore */
    }
  }, []);

  const [selectedStatus, setSelectedStatus] = useState('approved');
  const [targetConcept, setTargetConcept] = useState('');
  const [noteText, setNoteText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const allNodes = [...confusedNodes, ...weakestNodes];

  useEffect(() => {
    if (allNodes.length > 0 && !targetConcept) {
      setTargetConcept(allNodes[0].title || allNodes[0].name || "Newton's Laws");
    }
  }, [allNodes, targetConcept]);

  const handleSaveReview = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newReview = {
      id: Date.now(),
      studentName: student?.name || 'Student',
      studentEmail: student?.email || 'student@clariq.edu',
      concept: targetConcept || 'General Physics & Science',
      status: selectedStatus,
      note: noteText.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    setNoteText('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Parent Requests Card for Teacher */}
      {parentRequests.length > 0 && (
        <div className="p-6 rounded-3xl border border-purple-500/30 bg-slate-900/70 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="font-outfit text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" /> Incoming Parent Lesson Requests
            </h4>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              {parentRequests.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {parentRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-sm">{req.lessonName} ({req.subject})</span>
                  <span className="text-[10px] font-mono text-slate-400">{req.date}</span>
                </div>
                <p className="text-slate-300 italic">"{req.parentNote}"</p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Requested by parent of {req.childName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Review Input Form */}
      <div className="p-6 rounded-3xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-xl font-bold text-white">Student Progress Review & Feedback</h3>
              <p className="text-xs text-slate-400">
                Review {student?.name || 'Student'}'s Socratic turns and leave official teacher guidance notes.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
            Teacher Desk Active
          </span>
        </div>

        <form onSubmit={handleSaveReview} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Target Concept Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Concept / Node
              </label>
              <select
                value={targetConcept}
                onChange={(e) => setTargetConcept(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {allNodes.length > 0 ? (
                  allNodes.map((node, idx) => (
                    <option key={idx} value={node.title || node.name}>
                      {node.title || node.name} ({node.subject || 'Science'})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Newton's First Law">Newton's First Law (Physics)</option>
                    <option value="Balancing Chemical Equations">Balancing Chemical Equations (Chemistry)</option>
                    <option value="Photosynthesis & Cell Energy">Photosynthesis (Biology)</option>
                  </>
                )}
              </select>
            </div>

            {/* Mastery Review Status Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Mastery Status Evaluation
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStatus('approved')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    selectedStatus === 'approved'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  ✓ Approved
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('practice')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    selectedStatus === 'practice'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  ⚡ Practice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatus('reassess')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    selectedStatus === 'reassess'
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  🔄 Re-explain
                </button>
              </div>
            </div>

          </div>

          {/* Teacher Review Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Teacher Feedback & Socratic Action Notes
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Great job explaining inertia! Next turn, try describing what happens to a passenger when a bus stops suddenly."
              className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-4 h-4" /> Review note saved to student log!
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Notes are synced to {student?.name || 'student'}'s progress desk.
              </span>
            )}

            <button
              type="submit"
              disabled={!noteText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-40 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              Save Review Note
            </button>
          </div>
        </form>
      </div>

      {/* Review History Logs */}
      {reviews.length > 0 && (
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-4">
          <h4 className="font-outfit text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" /> Recent Teacher Review History
          </h4>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-300">{rev.concept}</span>
                  <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{rev.note}"
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">Student: {rev.studentName} ({rev.studentEmail})</span>
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
        </div>
      )}

    </div>
  );
}
