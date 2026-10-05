import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Composer from './Composer';
import EmptyState from './EmptyState';
import MessageList from './MessageList';
import YourTurnBar from '@/components/tutor/YourTurnBar';
import { lastSentenceIsQuestion } from '@/components/tutor/socraticKind';
import { copySessionTranscript } from '@/lib/sessionTranscript';
import { Button } from '@/components/ui';

export default function ChatView({
  session,
  isLoading,
  socraticMode,
  backendStatus,
  onSend,
  onRegenerate,
  onEditUser,
  onDeleteUser,
  onShareUser,
  composerDisabled = false,
  composerPlaceholder,
  footer = null,
  onUpload,
  uploadEnabled = false,
  uploadStatus = '',
}) {
  const messages = session?.messages ?? [];
  const backendDown = backendStatus === 'offline';
  const lastAi = [...messages].reverse().find((message) => message.sender === 'ai');
  const yourTurn =
    !isLoading &&
    !composerDisabled &&
    messages.length > 0 &&
    Boolean(lastAi) &&
    lastSentenceIsQuestion(lastAi.text);
  const placeholder =
    composerPlaceholder ??
    (yourTurn ? 'Answer the tutor…' : 'Ask a Grade 10 science question');
  const [copied, setCopied] = useState(false);

  const copyThread = async () => {
    const ok = await copySessionTranscript(session);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState onPrompt={composerDisabled ? undefined : onSend} />
        ) : (
          <div className="px-0 py-4 md:py-6">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              socraticMode={socraticMode}
              onRegenerate={composerDisabled ? null : onRegenerate}
              onEditUser={composerDisabled ? undefined : onEditUser}
              onDeleteUser={composerDisabled ? undefined : onDeleteUser}
              onShareUser={onShareUser}
            />
          </div>
        )}
      </div>

      {backendDown && (
        <p className="px-4 pb-1 text-center text-xs text-amber-300">
          Backend is offline. Start FastAPI on port 8000 to get tutor replies.
        </p>
      )}

      {footer}

      <div className="px-3 md:px-4">
        <YourTurnBar visible={yourTurn} />
        {messages.length > 0 ? (
          <div className="mx-auto mb-2 flex w-full max-w-3xl justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyThread}
              title="Copy this whole session"
              className="px-2 py-1"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="text-[11px]">
                {copied ? 'Copied session' : 'Copy this session'}
              </span>
            </Button>
          </div>
        ) : null}
      </div>

      <Composer
        onSend={onSend}
        isLoading={isLoading}
        socraticMode={socraticMode}
        disabled={composerDisabled}
        placeholder={placeholder}
        onUpload={onUpload}
        uploadEnabled={uploadEnabled}
        uploadStatus={uploadStatus}
      />
    </div>
  );
}
