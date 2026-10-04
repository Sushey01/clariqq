import { useState } from 'react';
import { Check, Copy, RotateCw, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import SocraticMoveCard from '@/components/tutor/SocraticMoveCard';
import StudentTurn from '@/components/tutor/StudentTurn';
import { resolveMoveKind } from '@/components/tutor/socraticKind';
import { saveNoteToNotebook } from '@/features/notebook/components/StudentNotebookModal';

export default function Message({
  message,
  index,
  onRegenerate,
  showYourTurn = false,
  socraticMode = 'strict',
  onEditUser,
  onDeleteUser,
  onShareUser,
}) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const saveNote = () => {
    saveNoteToNotebook({
      title: message.text.slice(0, 40) + '...',
      text: message.text,
      concept: 'Socratic Tutor Note',
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  if (isUser) {
    return (
      <StudentTurn
        text={message.text}
        onEdit={onEditUser ? (text) => onEditUser(index, text) : undefined}
        onDelete={onDeleteUser ? () => onDeleteUser(index) : undefined}
        onShare={onShareUser ? () => onShareUser(index) : undefined}
      />
    );
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
        <Button variant="ghost" size="sm" onClick={saveNote} className="px-2 py-1" title="Save to Notebook">
          {saved ? (
            <BookmarkCheck className="h-3.5 w-3.5 text-cyan-400" />
          ) : (
            <Bookmark className="h-3.5 w-3.5 hover:text-cyan-300" />
          )}
          <span className="text-[11px]">{saved ? 'Saved to Notebook!' : 'Save Note'}</span>
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
