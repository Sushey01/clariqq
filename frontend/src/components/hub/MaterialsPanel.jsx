import { useCallback, useEffect, useRef, useState } from 'react';
import { FileText, Loader2, Paperclip, Trash2 } from 'lucide-react';
import {
  deleteMaterial,
  listMaterials,
  reindexMaterial,
  uploadMaterial,
} from '@/api/client';
import { getAccessToken } from '@/auth/storage';
import { Badge, Button, Card } from '@/components/ui';

const ACCEPT = '.pdf,.txt,.md,.markdown,.csv';

export default function MaterialsPanel({ compact = false }) {
  const hasToken = Boolean(getAccessToken());
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!hasToken) return;
    try {
      setError('');
      setItems(await listMaterials());
    } catch (exc) {
      setError(exc.message);
    }
  }, [hasToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onFile = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      await uploadMaterial(file);
      await refresh();
    } catch (exc) {
      setError(exc.message);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const onRetry = async (id) => {
    setBusy(true);
    setError('');
    try {
      await reindexMaterial(id);
      await refresh();
    } catch (exc) {
      setError(exc.message);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    setBusy(true);
    setError('');
    try {
      await deleteMaterial(id);
      await refresh();
    } catch (exc) {
      setError(exc.message);
    } finally {
      setBusy(false);
    }
  };

  if (!hasToken) {
    return (
      <Card className={compact ? 'p-4' : 'p-5'}>
        <p className="text-sm font-semibold">My materials</p>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">
          Sign in with Google to upload notes. Email-only accounts stay on the shared
          textbook.
        </p>
      </Card>
    );
  }

  return (
    <Card className={compact ? 'p-4' : 'p-5'}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">My materials</p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            PDF, text, markdown, or CSV. Clariq quizzes from your notes plus the textbook.
          </p>
        </div>
        <Button
          variant="secondary"
          size="md"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Paperclip className="h-3.5 w-3.5" />
          )}
          <span>Upload</span>
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            onFile(file);
          }}
        />
      </div>

      {error ? (
        <p className="mt-3 text-xs text-rose-400">{error}</p>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-4 text-xs text-[var(--ink-faint)]">No files yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 truncate text-sm">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--ink-faint)]" />
                  <span className="truncate">{item.filename}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {item.indexed ? (
                    <Badge variant="emerald" size="sm">
                      Indexed
                    </Badge>
                  ) : (
                    <Badge variant="amber" size="sm">
                      Not indexed
                    </Badge>
                  )}
                </div>
                {!item.indexed && item.index_error ? (
                  <p className="mt-1 line-clamp-2 text-[11px] text-[var(--ink-muted)]">
                    {item.index_error}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!item.indexed ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => onRetry(item.id)}
                  >
                    Retry
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="iconSm"
                  disabled={busy}
                  title="Delete"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
