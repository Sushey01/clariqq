import { useState } from 'react';
import { Heart, MessageCircle, Sparkles, CheckCircle2, Send, HelpCircle } from 'lucide-react';

const PARENT_NOTES_KEY = 'clariq_parent_notes_v1';

export default function ParentReviewPanel({ child, confusedNodes = [], weakestNodes = [] }) {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(PARENT_NOTES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [message, setMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSendParentNote = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newNote = {
      id: Date.now(),
      childName: child?.name || 'Your Child',
      message: message.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      localStorage.setItem(PARENT_NOTES_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    setMessage('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Home Discussion Questions for Parents */}
      <div className="p-6 rounded-3xl border border-purple-500/30 bg-slate-900/70 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit text-xl font-bold text-white">Parent Socratic Conversation Starters</h3>
            <p className="text-xs text-slate-400">
              Simple 1-minute questions to ask {child?.name || 'your child'} at home without any textbook jargon.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Physics Starter</span>
            <p className="text-xs font-semibold text-slate-200">
              "When you hit the brakes on a bus, why do you lean forward?"
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Encourages explaining inertia in real life.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-400">Chemistry Starter</span>
            <p className="text-xs font-semibold text-slate-200">
              "Why does lemon juice taste sour while soap feels slippery?"
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Connects everyday household items to Acids & Bases.
            </p>
          </div>
        </div>
      </div>

      {/* Parent Encouragement & Note Form */}
      <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-xl font-bold text-white">Send Parent Encouragement Note</h3>
              <p className="text-xs text-slate-400">
                Leave a positive note for {child?.name || 'your child'}. It will display on their Clariq study desk.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSendParentNote} className="space-y-4">
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Keep up the great work on science this week! So proud of how hard you are working on your SEE practice."
            className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />

          <div className="flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4" /> Note sent to {child?.name || 'child'}'s desk!
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Encouragement helps build student practice consistency.
              </span>
            )}

            <button
              type="submit"
              disabled={!message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs shadow-md disabled:opacity-40 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              Send Encouragement Note
            </button>
          </div>
        </form>

        {/* Saved Parent Notes Log */}
        {notes.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sent Notes Log</span>
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 flex justify-between items-start text-xs gap-3">
                  <p className="text-slate-300 italic">"{note.message}"</p>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{note.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
