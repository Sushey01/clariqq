import { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { lastSentenceIsQuestion } from '@/components/tutor/socraticKind';

export default function MessageList({ messages, isLoading, onRegenerate, socraticMode }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-1 px-4 md:px-0">
      {messages.map((message, index) => {
        const isLastAi =
          index === messages.length - 1 &&
          message.sender === 'ai' &&
          lastSentenceIsQuestion(message.text);
        return (
          <Message
            key={`${message.sender}-${index}`}
            message={message}
            showYourTurn={isLastAi}
            socraticMode={socraticMode}
            onRegenerate={
              index === messages.length - 1 && message.sender === 'ai'
                ? onRegenerate
                : null
            }
          />
        );
      })}
      {isLoading && <TypingIndicator />}
      <div ref={endRef} className="h-4" />
    </div>
  );
}
