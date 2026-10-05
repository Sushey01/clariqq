import React, { useState } from 'react';
import { Terminal, Check, Copy } from 'lucide-react';
import Button from './Button';

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-sidebar)] font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-raised)] border-b border-[var(--border)] text-[var(--ink-muted)]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            {language || 'text'}
          </span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="text-[11px] font-sans py-1 px-2.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </Button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-[var(--ink)] leading-relaxed">
        <pre className="m-0 bg-transparent p-0 border-none">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
