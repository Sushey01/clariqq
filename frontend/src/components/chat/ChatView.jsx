import Composer from './Composer';
import EmptyState from './EmptyState';
import MessageList from './MessageList';
import YourTurnBar from '@/components/tutor/YourTurnBar';
import { lastSentenceIsQuestion } from '@/components/tutor/socraticKind';

export default function ChatView({
  session,
  isLoading,
  socraticMode,
  backendStatus,
  onSend,
  onRegenerate,
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
