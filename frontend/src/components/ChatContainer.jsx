import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { 
  Loader2, 
  Sparkles, 
  Atom, 
  Dna, 
  Zap, 
  Globe, 
  ArrowUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Textarea, Button, Badge } from '@/components/ui';

const ChatContainer = ({ 
  session, 
  onSendMessage, 
  isLoading, 
  socraticMode 
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const messages = session ? session.messages : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const textToSend = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendMessage(textToSend);
  };

  const promptCards = [
    {
      title: "Newton's Laws of Motion",
      subtitle: "Why do objects keep moving in deep space without thrust?",
      icon: Atom,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
      query: "Can you help me understand Newton's First Law of Motion step-by-step using Socratic questions?"
    },
    {
      title: "DNA & RNA Replication",
      subtitle: "How does genetic information transcribe during cell division?",
      icon: Dna,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
      query: "Explain the process of DNA replication to me by guiding me through each step with questions."
    },
    {
      title: "Balancing Chemical Equations",
      subtitle: "Master the Law of Conservation of Mass in stoichiometry.",
      icon: Zap,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
      query: "How do I balance chemical reactions? Guide me through an example without giving the final answer immediately."
    },
    {
      title: "Light Refraction & Lenses",
      subtitle: "Why does a pencil look bent when placed in a glass of water?",
      icon: Globe,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
      query: "Why does light refract when moving between air and water? Ask me a question to test my intuition first."
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121] relative overflow-hidden">
      
      {/* Messages Scroll Viewport with WCAG scroll-padding bottom to prevent focus obscuration */}
      <div 
        className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-0 py-6 scroll-smooth space-y-2"
        style={{ scrollPaddingBottom: '140px' }}
        tabIndex={-1}
      >
        {messages.length === 0 ? (
          /* Empty / Landing State */
          <div className="min-h-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4 py-8 text-center select-none">
            
            {/* Animated Logo Header */}
            <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 border border-white/10 mb-6 group transition-transform hover:scale-105" aria-hidden="true">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <h1 className="font-outfit font-bold text-2xl sm:text-3xl text-white tracking-tight mb-2">
              What Socratic concept shall we explore today?
            </h1>
            <p className="text-sm text-zinc-300 max-w-md mb-8 leading-relaxed">
              Clariq is your Grade 10 Socratic AI Science Tutor. Ask any question to start discovering answers step-by-step.
            </p>

            {/* Responsive Prompt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl" role="region" aria-label="Suggested study topics">
              {promptCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={idx}
                    hoverable
                    onClick={() => onSendMessage(card.query)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Explore topic: ${card.title}. ${card.subtitle}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSendMessage(card.query);
                      }
                    }}
                    className="flex flex-col justify-between min-h-[112px] h-auto p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="font-outfit font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors">
                        {card.title}
                      </span>
                      <div className={`p-1.5 rounded-lg border bg-gradient-to-br ${card.color}`}>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed group-hover:text-zinc-100 transition-colors">
                      {card.subtitle}
                    </p>
                  </Card>
                );
              })}
            </div>

          </div>
        ) : (
          /* Messages Feed */
          <main className="max-w-3xl mx-auto w-full space-y-4" aria-live="polite" aria-label="Chat messages stream">
            {messages.map((msg, idx) => (
              <MessageBubble 
                key={idx} 
                message={msg}
                onRegenerate={
                  idx === messages.length - 1 && msg.sender === 'ai'
                    ? () => {
                        const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
                        if (lastUserMsg) onSendMessage(lastUserMsg.text);
                      }
                    : null
                } 
              />
            ))}

            {/* Loading / Thinking Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-4 max-w-3xl mx-auto w-full flex items-start space-x-4 px-4 md:px-0"
                aria-busy="true"
                aria-label="Clariq is formulating Socratic response"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 border border-white/10" aria-hidden="true">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="flex items-center space-x-2 bg-zinc-800/90 border border-white/10 px-4 py-3 rounded-2xl text-xs text-zinc-200">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" aria-hidden="true" />
                  <span className="font-medium">Formulating Socratic response...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-6" />
          </main>
        )}
      </div>

      {/* Floating Bottom Input Dock */}
      <div className="p-3 md:p-4 bg-gradient-to-t from-[#212121] via-[#212121]/95 to-transparent sticky bottom-0 z-20">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto w-full" aria-label="Ask Socratic tutor form">
          <div className="relative flex flex-col bg-[#2f2f2f] hover:bg-[#333333] focus-within:bg-[#333333] border border-white/15 focus-within:border-indigo-400 shadow-2xl rounded-3xl transition-all duration-200 p-2">
            
            {/* Main Textarea */}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a scientific question... (Shift + Enter for new line)"
              aria-label="Scientific question input"
              disabled={isLoading}
            />

            {/* Bottom Bar Controls inside Textarea */}
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <div className="flex items-center space-x-2">
                <Badge variant="indigo" size="md" dot pulse>
                  <span className="capitalize">{socraticMode} Socratic</span>
                </Badge>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="iconRound"
                disabled={isLoading || !input.trim()}
                title="Send message"
                aria-label="Send message to Socratic tutor"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </form>

        {/* Footer Disclaimer with WCAG AA compliant text color */}
        <div className="text-center mt-2">
          <p className="text-[11px] text-zinc-400 font-medium">
            Clariq Socratic AI can make mistakes. Verify important scientific facts.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ChatContainer;
