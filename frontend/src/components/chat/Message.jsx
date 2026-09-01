import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy, RotateCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button, CodeBlock } from '@/components/ui';

export default function Message({ message, onRegenerate }) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const copy = async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (isUser) {
    return (
      <div className="flex w-full justify-end py-3">
        <div className="max-w-[85%] rounded-3xl rounded-tr-md bg-[#2f2f2f] px-5 py-3 text-[15px] leading-relaxed text-zinc-100 sm:max-w-[75%]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-4 py-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-black">
        C
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-sm font-semibold text-zinc-100">Clariq</p>
        <div className="chatgpt-markdown text-[15px] text-zinc-200">
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const code = String(children).replace(/\n$/, '');
                if (!inline && (match || code.includes('\n'))) {
                  return <CodeBlock language={match ? match[1] : ''} code={code} />;
                }
                return (
                  <code
                    className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-zinc-200"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        <div className="mt-2 flex items-center gap-1 text-zinc-400">
          <Button variant="ghost" size="sm" onClick={copy} className="px-2 py-1">
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
          {onRegenerate && (
            <Button
              variant="ghost"
              size="iconSm"
              onClick={onRegenerate}
              title="Regenerate"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            className={feedback === 'up' ? 'text-emerald-400' : ''}
            title="Good response"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            className={feedback === 'down' ? 'text-rose-400' : ''}
            title="Bad response"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
