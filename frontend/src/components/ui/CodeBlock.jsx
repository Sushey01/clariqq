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
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] font-mono text-xs shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-white/10 text-zinc-400">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
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
      <div className="p-4 overflow-x-auto text-zinc-200 leading-relaxed">
        <pre className="m-0 bg-transparent p-0 border-none">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
