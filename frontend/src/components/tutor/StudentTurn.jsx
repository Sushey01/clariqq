import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react';

export default function StudentTurn({
  text,
  onEdit,
  onDelete,
  onShare,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const menuRef = useRef(null);
  const canManage = Boolean(onEdit || onDelete || onShare);

  useEffect(() => {
    setDraft(text);
  }, [text]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const save = () => {
    const next = draft.trim();
    if (!next || !onEdit) return;
    onEdit(next);
    setEditing(false);
  };

  return (
    <div className="flex w-full justify-end py-3">
      <div className="max-w-[85%] sm:max-w-[75%]">
        <div className="mb-1 flex items-center justify-end gap-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-faint)]">
            Your reasoning
          </p>
          {canManage && !editing ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="rounded-md p-1 text-[var(--ink-faint)] hover:text-[var(--ink)]"
                title="More"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-20 mt-1 min-w-[9rem] rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-1 shadow-lg">
                  {onEdit ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-[var(--bg-input)]"
                      onClick={() => {
                        setMenuOpen(false);
                        setEditing(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  ) : null}
                  {onShare ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-[var(--bg-input)]"
                      onClick={() => {
                        setMenuOpen(false);
                        onShare();
                      }}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-rose-300 hover:bg-[var(--bg-input)]"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {editing ? (
          <div className="lab-glass rounded-[1.5rem] rounded-tr-md px-4 py-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-[var(--ink)] outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                className="text-xs text-[var(--ink-muted)]"
                onClick={() => {
                  setDraft(text);
                  setEditing(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-[var(--accent)]"
                onClick={save}
              >
                Save and resend
              </button>
            </div>
          </div>
        ) : (
          <div className="lab-glass rounded-[1.5rem] rounded-tr-md px-5 py-3 text-[15px] leading-relaxed text-[var(--ink)]">
            {text}
          </div>
        )}
      </div>
    </div>
  );
}
