import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Send, UserCheck, MessageSquare, CheckCircle, Sparkles } from 'lucide-react';

const MOCK_ROSTER = [
  { id: 'stu-1', name: 'Aarav Sharma', parentEmail: 'parent@clariq.edu', code: 'STU-9482', grade: 'Class 10 Science' },
  { id: 'stu-2', name: 'Bina Thapa', parentEmail: 'parent.bina@clariq.edu', code: 'STU-1024', grade: 'Class 10 Science' },
  { id: 'stu-3', name: 'Chirag Shrestha', parentEmail: 'parent.chirag@clariq.edu', code: 'STU-5541', grade: 'Class 10 Science' },
];

export default function SendParentReportModal({ isOpen, onClose, onSent }) {
  const [selectedStudentId, setSelectedStudentId] = useState(MOCK_ROSTER[0].id);
  const [category, setCategory] = useState('progress');
  const [subject, setSubject] = useState('Physics & Chemistry Progress Update');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const activeStudent = MOCK_ROSTER.find((s) => s.id === selectedStudentId) || MOCK_ROSTER[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setPending(true);

    setTimeout(() => {
      setPending(false);
      setSuccess(true);
      if (onSent) {
        onSent({
          studentName: activeStudent.name,
          parentEmail: activeStudent.parentEmail,
          category,
          subject,
          message,
          timestamp: new Date().toLocaleDateString(),
        });
      }
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 1800);
    }, 700);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Individual Report to Parent"
      icon={Send}
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="font-outfit text-xl font-bold text-white">Report Sent Successfully!</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Direct evaluation report sent to <span className="font-semibold text-cyan-300">{activeStudent.parentEmail}</span> for <span className="font-semibold text-white">{activeStudent.name}</span>.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Student from Class Roster
            </label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {MOCK_ROSTER.map((s) => (
                  <option key={s.id} value={s.id}>
                    🎓 {s.name} ({s.code}) — Parent: {s.parentEmail}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-cyan-500/20 bg-slate-900/80 flex items-center gap-3 text-xs">
            <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white">{activeStudent.name}</span>
              <span className="text-slate-400"> · Linked Parent Account: </span>
              <span className="font-mono text-cyan-300">{activeStudent.parentEmail}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Report Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('progress')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  category === 'progress'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                📈 Progress Update
              </button>
              <button
                type="button"
                onClick={() => setCategory('commendation')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  category === 'commendation'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🌟 Commendation
              </button>
              <button
                type="button"
                onClick={() => setCategory('focus')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  category === 'focus'
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🎯 Focus Needed
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Report Subject Title
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Unit 3 Optics & Thermodynamics Progress"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Teacher's Detailed Evaluation & Message
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write your specific feedback or observation for ${activeStudent.name}'s parent...`}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !message.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-md disabled:opacity-40 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {pending ? 'Sending Report...' : 'Send to Parent'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
