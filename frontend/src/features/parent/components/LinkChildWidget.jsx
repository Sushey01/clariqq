import { useState } from 'react';
import { Link2, CheckCircle, ShieldCheck, UserCheck } from 'lucide-react';

export default function LinkChildWidget({ currentChild }) {
  const [code, setCode] = useState('');
  const [linkedChild, setLinkedChild] = useState(currentChild);
  const [success, setSuccess] = useState(false);

  const handleLink = (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    const updated = {
      id: `stu-${Date.now()}`,
      name: `Student (${code.trim().toUpperCase()})`,
      code: code.trim().toUpperCase(),
      email: `${code.trim().toLowerCase()}@school.edu`,
    };

    setLinkedChild(updated);
    setSuccess(true);
    setCode('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit text-xl font-bold text-white">Parent-Child Account Linking</h3>
            <p className="text-xs text-slate-400">
              Parent privacy isolation: Parents can only view progress signals for their linked child.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-cyan-300">
          Linked Code: {linkedChild?.code || 'STU-9482'}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-center">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-purple-400">Active Linked Child</span>
            <p className="text-sm font-bold text-white">{linkedChild?.name || 'Aarav Sharma'}</p>
            <p className="text-[11px] text-slate-400">Class 10 SEE · Science Track</p>
          </div>
        </div>

        <form onSubmit={handleLink} className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Link Another Child via Student Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. STU-8821"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono"
            />
            <button
              type="submit"
              disabled={!code.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5" />
              Link
            </button>
          </div>
          {success && (
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
              <CheckCircle className="w-3.5 h-3.5" /> Child account linked successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
