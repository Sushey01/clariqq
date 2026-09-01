import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { Badge, Button, Textarea } from '@/components/ui';
import { SOCRATIC_MODES } from '@/constants/app';

export default function Composer({
  onSend,
  isLoading,
  socraticMode,
  disabled = false,
  placeholder = 'Ask anything about Grade 10 science',
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
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
    <div className="px-3 pb-3 pt-2 md:px-4 bg-[#212121]">
      <form onSubmit={submit} className="mx-auto w-full max-w-3xl">
        <div className="rounded-[28px] border border-white/10 bg-[#303030] focus-within:border-white/20 transition-colors">
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
            <Badge variant="zinc" size="md">
              {mode?.title ?? 'Strict'} Socratic
            </Badge>
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
        <p className="mt-2 text-center text-[11px] text-zinc-500">
          Clariq can be wrong. Check important facts against your textbook.
        </p>
      </form>
    </div>
  );
}
