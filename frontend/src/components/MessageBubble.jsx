import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex w-full max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center mt-1 shadow-sm ${
          isUser 
            ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50' 
            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-white/10'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>

        {/* Bubble */}
        <div 
          className={`px-6 py-4 rounded-3xl ${
            isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' 
              : 'bg-slate-800/80 border border-slate-700/50 backdrop-blur-md text-slate-200 rounded-tl-sm shadow-lg'
          }`}
        >
          <div className={`prose prose-invert max-w-none text-[15px] leading-relaxed font-inter font-normal ${isUser ? 'prose-p:text-white' : 'prose-p:text-slate-200'}`}>
            <ReactMarkdown>
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
