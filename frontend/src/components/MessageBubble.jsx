import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCw, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Badge, CodeBlock } from '@/components/ui';

const MessageBubble = ({ message, onRegenerate }) => {
  const isUser = message.sender === 'user';
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'like' | 'dislike' | null

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`w-full py-4 md:py-6 ${isUser ? 'flex justify-end' : 'bg-transparent'}`}
    >
      <div className={`mx-auto max-w-3xl w-full flex space-x-4 px-4 md:px-0 ${isUser ? 'justify-end' : ''}`}>
        
        {/* User Message: Right-aligned pill/bubble */}
        {isUser ? (
          <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] space-y-1">
            <div className="bg-[#2f2f2f] text-zinc-100 px-5 py-3.5 rounded-3xl rounded-tr-md shadow-md border border-white/5 font-inter text-[15px] leading-relaxed break-words">
              {message.text}
            </div>
          </div>
        ) : (
          /* AI Assistant Message: Full width clean ChatGPT style */
          <div className="flex items-start space-x-4 w-full">
            {/* AI Avatar Icon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-indigo-500/20 border border-white/10">
              <Sparkles className="w-4 h-4" />
            </div>

            {/* AI Message Body & Content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Header Label */}
              <div className="flex items-center space-x-2">
                <span className="font-outfit font-bold text-sm text-zinc-100">Clariq Socratic</span>
                <Badge variant="indigo" size="sm">
                  RAG Tutor
                </Badge>
              </div>

              {/* Formatted Markdown Content */}
              <div className="chatgpt-markdown text-[15px] leading-relaxed text-zinc-200">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      if (!inline && (match || codeString.includes('\n'))) {
                        return <CodeBlock language={match ? match[1] : ''} code={codeString} />;
                      }
                      return (
                        <code className="bg-zinc-800 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>

              {/* Message Footer Action Bar */}
              <div className="flex items-center space-x-2 pt-2 text-zinc-400 text-xs">
                {/* Copy Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyMessage}
                  title="Copy response"
                  className="px-2 py-1"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </Button>

                {/* Regenerate Button */}
                {onRegenerate && (
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={onRegenerate}
                    title="Regenerate response"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </Button>
                )}

                {/* Feedback Buttons */}
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
                  className={feedback === 'like' ? 'text-emerald-400 bg-emerald-500/10' : ''}
                  title="Good response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
                  className={feedback === 'dislike' ? 'text-rose-400 bg-rose-500/10' : ''}
                  title="Bad response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default MessageBubble;
