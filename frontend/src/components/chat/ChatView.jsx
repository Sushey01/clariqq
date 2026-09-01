import Composer from './Composer';
import EmptyState from './EmptyState';
import MessageList from './MessageList';

export default function ChatView({
  session,
  isLoading,
  socraticMode,
  backendStatus,
  onSend,
  onRegenerate,
}) {
  const messages = session?.messages ?? [];
  const backendDown = backendStatus === 'offline';

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#212121]">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState onPrompt={onSend} />
        ) : (
          <div className="px-0 py-4 md:py-6">
            <MessageList
              messages={messages}
              isLoading={isLoading}
              onRegenerate={onRegenerate}
            />
          </div>
        )}
      </div>

      {backendDown && (
        <p className="px-4 pb-1 text-center text-xs text-amber-300">
          Backend is offline. Start FastAPI on port 8000 to get tutor replies.
        </p>
      )}

      <Composer
        onSend={onSend}
        isLoading={isLoading}
        socraticMode={socraticMode}
      />
    </div>
  );
}
