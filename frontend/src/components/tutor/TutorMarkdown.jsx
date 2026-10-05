import ReactMarkdown from 'react-markdown';
import { CodeBlock } from '@/components/ui';

export default function TutorMarkdown({ children }) {
  return (
    <div className="tutor-markdown text-[15px]">
      <ReactMarkdown
        components={{
          code({ inline, className, children: codeChildren, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const code = String(codeChildren).replace(/\n$/, '');
            if (!inline && (match || code.includes('\n'))) {
              return <CodeBlock language={match ? match[1] : ''} code={code} />;
            }
            return (
              <code
                className="rounded bg-[var(--bg-bubble)] px-1.5 py-0.5 font-mono text-sm"
                {...props}
              >
                {codeChildren}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
