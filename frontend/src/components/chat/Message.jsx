import { useState } from 'react';
import { Check, Copy, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui';
import SocraticMoveCard from '@/components/tutor/SocraticMoveCard';
import StudentTurn from '@/components/tutor/StudentTurn';
import { resolveMoveKind } from '@/components/tutor/socraticKind';

export default function Message({
  message,
  onRegenerate,
  showYourTurn = false,
  socraticMode = 'strict',
}) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (isUser) {
    return <StudentTurn text={message.text} />;
  }

  const kind = resolveMoveKind(message, socraticMode);

  return (
    <div>
      <SocraticMoveCard
        kind={kind}
        text={message.text}
        yourTurn={showYourTurn}
        sources={message.sources}
      />
      <div className="-mt-1 mb-2 flex items-center gap-1 text-[var(--ink-muted)]">
        <Button variant="ghost" size="sm" onClick={copy} className="px-2 py-1">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
        {onRegenerate ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            title="Ask again"
            className="px-2 py-1"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span className="text-[11px]">Ask again</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
