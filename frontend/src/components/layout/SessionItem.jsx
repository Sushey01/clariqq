import { useState } from 'react';
import { Check, Copy, Edit3, MessageSquare, MoreVertical, Trash2, X } from 'lucide-react';
import { copySessionTranscript } from '@/lib/sessionTranscript';
import { Dropdown } from '@/components/ui';

export default function SessionItem({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState(session.title);
  const canCopy = (session.messages || []).length > 0;

  const save = (event) => {
    event.stopPropagation();
    if (title.trim()) onRename(session.id, title.trim());
    setEditing(false);
  };

  const handleCopy = async (event) => {
    event.stopPropagation();
    setMenuOpen(false);
    const ok = await copySessionTranscript(session);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(session.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect(session.id);
      }}
      className={`group relative flex cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-sm transition-all ${
        isActive
          ? 'bg-[var(--accent-soft)] text-[var(--ink)] font-medium shadow-xs'
          : 'text-[var(--ink-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--ink)]'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
        <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
        {editing ? (
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') save(event);
              if (event.key === 'Escape') setEditing(false);
            }}
            autoFocus
            className="w-full rounded border border-indigo-500 bg-zinc-900 px-1.5 py-0.5 text-xs text-white outline-none"
          />
        ) : (
          <span className="truncate text-xs">{session.title || 'New session'}</span>
        )}
      </div>

      {editing ? (
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={save} className="p-1 text-zinc-300 hover:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setEditing(false);
            }}
            className="p-1 text-zinc-300 hover:text-rose-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <Dropdown
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            width="w-36"
            align="right"
            trigger={
              <button
                type="button"
                title="Session options"
                aria-label="Session options"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className={`p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-opacity ${
                  menuOpen ? 'opacity-100 bg-zinc-800' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                }`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            }
          >
            <div className="py-1 space-y-0.5" role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setTitle(session.title);
                  setEditing(true);
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors text-left"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rename</span>
              </button>

              {canCopy && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleCopy}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors text-left"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy transcript'}</span>
                </button>
              )}

              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(session.id);
                }}
                className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete</span>
              </button>
            </div>
          </Dropdown>
        </div>
      )}
    </div>
  );
}
