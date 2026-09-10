import { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

export default function MessageList({ messages, isLoading, onRegenerate }) {
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
          /\?\s*$/.test(message.text.trim());
        return (
          <Message
            key={`${message.sender}-${index}`}
            message={message}
            showYourTurn={isLastAi}
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
