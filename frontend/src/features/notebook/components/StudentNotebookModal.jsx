import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { BookOpen, Trash2, Copy, Check, Search, Sparkles, Plus, FileText } from 'lucide-react';

const STORAGE_KEY = 'clariq_student_notebook_v1';

export function getSavedNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return [
    {
      id: 'note-1',
      title: 'Buoyancy & Archimedes Principle Formula',
      text: 'Archimedes principle states that any object completely or partially submerged in a fluid experiences an upward buoyant force equal to the weight of the fluid displaced by the object. Upthrust (F) = V × ρ × g',
      concept: 'Physics - Hydrostatics',
      createdAt: Date.now() - 3600000 * 24,
    },
    {
      id: 'note-2',
      title: 'Modern Periodic Law Summary',
      text: 'Physical and chemical properties of elements are periodic functions of their atomic numbers, not atomic masses. Moseleys law resolved anomalies in Mendeleevs table like Argon-Potassium placement.',
      concept: 'Chemistry - Periodic Table',
      createdAt: Date.now() - 3600000 * 48,
    }
  ];
}

export function saveNoteToNotebook(note) {
  const current = getSavedNotes();
  const exists = current.some((n) => n.text === note.text);
  if (exists) return false;

  const newNote = {
    id: `note-${Date.now()}`,
    title: note.title || 'Saved Chat Response',
    text: note.text,
    concept: note.concept || 'Socratic Science',
    createdAt: Date.now(),
  };

  const updated = [newNote, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
  return true;
}

export default function StudentNotebookModal({ isOpen, onClose }) {
  const [notes, setNotes] = useState(getSavedNotes);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomText, setNewCustomText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes(getSavedNotes());
    }
  }, [isOpen]);

  const handleDelete = (id) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCustomNote = (e) => {
    e.preventDefault();
    if (!newCustomText.trim()) return;
    saveNoteToNotebook({
      title: newCustomTitle.trim() || 'My Personal Study Note',
      text: newCustomText.trim(),
      concept: 'Personal Note',
    });
    setNotes(getSavedNotes());
    setNewCustomTitle('');
    setNewCustomText('');
    setAddingNote(false);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.text.toLowerCase().includes(search.toLowerCase()) ||
      n.concept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Socratic Personal Study Notebook"
      icon={BookOpen}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved notes & formulas..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setAddingNote(!addingNote)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            {addingNote ? 'Cancel' : 'Add Note'}
          </button>
        </div>

        {/* Add Note Form */}
        {addingNote && (
          <form onSubmit={handleAddCustomNote} className="p-4 rounded-2xl border border-cyan-500/30 bg-slate-900/90 space-y-3">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Write Custom Study Note
            </h4>
            <input
              type="text"
              placeholder="Title (e.g. Pascal's Law Formula)"
              value={newCustomTitle}
              onChange={(e) => setNewCustomTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <textarea
              required
              rows={3}
              placeholder="Write your formula, notes, or explanation here..."
              value={newCustomText}
              onChange={(e) => setNewCustomText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-md"
            >
              Save Note
            </button>
          </form>
        )}

        {/* Notes List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filteredNotes.length === 0 ? (
            <div className="py-10 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl p-6">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No saved notes found in your notebook.</p>
              <p className="text-[11px] text-slate-500">
                Click the bookmark icon on any AI tutor chat bubble to save key formulas & explanations here!
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-semibold text-cyan-300">
                      {note.concept}
                    </span>
                    <h4 className="font-outfit font-bold text-sm text-white">{note.title}</h4>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCopy(note.id, note.text)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Copy to clipboard"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-rose-400"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {note.text}
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Saved: {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
