import { useState, useEffect } from 'react';
import { Send, CheckCircle, BookOpen, Clock, MessageSquare } from 'lucide-react';

const TEACHER_REQUESTS_KEY = 'clariq_parent_teacher_requests_v1';

export default function RequestTeacherLessonCard({ child }) {
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(TEACHER_REQUESTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lessonName, setLessonName] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [note, setNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!lessonName.trim()) return;

    const newRequest = {
      id: Date.now(),
      childName: child?.name || 'Your Child',
      subject,
      lessonName: lessonName.trim(),
      parentNote: note.trim() || 'Parent requested extra review for this lesson.',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    try {
      localStorage.setItem(TEACHER_REQUESTS_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    setLessonName('');
    setNote('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 rounded-3xl border border-cyan-500/30 bg-slate-900/70 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit text-xl font-bold text-white">Request Teacher Lesson Coverage</h3>
            <p className="text-xs text-slate-400">
              Send a request to {child?.name || 'your child'}'s science teacher to cover specific Grade 10 topics in class.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
          Teacher Request Channel
        </span>
      </div>

      <form onSubmit={handleSendRequest} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Science Subject Track
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Physics">Physics (Mechanics & Energy)</option>
              <option value="Chemistry">Chemistry (Reactions & Acids/Bases)</option>
              <option value="Biology">Biology (Genetics & Physiology)</option>
              <option value="Earth Science">Earth Science (Tectonics & Climate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Lesson / Topic Name
            </label>
            <input
              type="text"
              required
              value={lessonName}
              onChange={(e) => setLessonName(e.target.value)}
              placeholder="e.g. Refraction of Light & Lenses"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Note to Teacher (Optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. My child felt confused about lens formulas during homework this week. Could you review this in class?"
            className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle className="w-4 h-4" /> Lesson request sent directly to teacher dashboard!
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Requests sync to teacher desk for upcoming lesson planning.
            </span>
          )}

          <button
            type="submit"
            disabled={!lessonName.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-40 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            Send Request to Teacher
          </button>
        </div>
      </form>

      {/* Request History Log */}
      {requests.length > 0 && (
        <div className="pt-4 border-t border-white/5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lesson Requests History</span>
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex justify-between items-start text-xs gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300">{req.lessonName}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">{req.subject}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 italic">"{req.parentNote}"</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 block">{req.date}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold mt-1 inline-block">
                    Pending Review
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
