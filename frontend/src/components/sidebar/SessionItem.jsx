import { useState } from 'react';
import { Check, Edit3, MessageSquare, Trash2, X } from 'lucide-react';

export default function SessionItem({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(session.title);

  const save = (event) => {
    event.stopPropagation();
    if (title.trim()) onRename(session.id, title.trim());
    setEditing(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(session.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect(session.id);
      }}
      className={`group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-sm ${
        isActive
          ? 'bg-[var(--bg-card)] text-[var(--ink)]'
          : 'text-[var(--ink-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--ink)]'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
        <MessageSquare className="h-4 w-4 shrink-0" />
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
            className="w-full rounded border border-[var(--border)] bg-[var(--bg-input)] px-1.5 py-0.5 text-xs text-[var(--ink)] outline-none"
          />
        ) : (
          <span className="truncate">{session.title || 'New chat'}</span>
        )}
      </div>

      {editing ? (
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={save} className="p-1 hover:text-white">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setEditing(false);
            }}
            className="p-1 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="hidden shrink-0 gap-1 group-hover:flex">
          <button
            type="button"
            title="Rename"
            onClick={(event) => {
              event.stopPropagation();
              setTitle(session.title);
              setEditing(true);
            }}
            className="p-1 hover:text-white"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Delete"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(session.id);
            }}
            className="p-1 hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
