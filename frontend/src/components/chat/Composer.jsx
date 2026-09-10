import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2, Paperclip } from 'lucide-react';
import { Badge, Button, Textarea } from '@/components/ui';
import { SOCRATIC_MODES } from '@/constants/app';

const ACCEPT = '.pdf,.txt,.md,.markdown,.csv';

export default function Composer({
  onSend,
  isLoading,
  socraticMode,
  disabled = false,
  placeholder = 'Ask anything about Grade 10 science',
  onUpload,
  uploadEnabled = false,
  uploadStatus = '',
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const mode = SOCRATIC_MODES.find((item) => item.id === socraticMode);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 200)}px`;
  }, [input]);

  const submit = (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || isLoading || disabled) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSend(text);
  };

  return (
    <div className="px-3 pb-3 pt-2 md:px-4 bg-[var(--bg-canvas)]">
      <form onSubmit={submit} className="mx-auto w-full max-w-3xl">
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--bg-raised)] focus-within:border-[var(--accent)] transition-colors">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit(event);
              }
            }}
            placeholder={placeholder}
            disabled={isLoading || disabled}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="zinc" size="md">
                {mode?.title ?? 'Strict'} Socratic
              </Badge>
              {uploadEnabled ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="iconSm"
                    disabled={isLoading || disabled}
                    title="Upload notes"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) onUpload?.(file);
                    }}
                  />
                </>
              ) : null}
            </div>
            <Button
              type="submit"
              variant="primary"
              size="iconRound"
              disabled={isLoading || disabled || !input.trim()}
              title="Send"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              )}
            </Button>
          </div>
        </div>
        {uploadStatus ? (
          <p className="mt-2 text-center text-[11px] text-[var(--ink-muted)]">{uploadStatus}</p>
        ) : (
          <p className="mt-2 text-center text-[11px] text-[var(--ink-faint)]">
            Clariq can be wrong. Check important facts against your textbook.
          </p>
        )}
      </form>
    </div>
  );
}
