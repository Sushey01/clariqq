import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatContainer = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I am your **Clariq Socratic Science Tutor**. What topic would you like to explore today? We can dive into Physics, Chemistry, or Biology." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { sender: 'user', text: userQuery }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userQuery, session_id: 'default_session' })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.answer }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Sorry, I am having trouble connecting to the inference engine right now.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth flex flex-col space-y-6 z-10 relative">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex w-full justify-start mb-6"
          >
            <div className="bg-slate-800/80 border border-slate-700/50 backdrop-blur-md px-5 py-4 rounded-3xl rounded-tl-sm flex items-center space-x-3 shadow-lg">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-sm font-medium text-slate-300">Formulating response...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-6 pt-2 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent z-20">
        <form onSubmit={handleSubmit} className="relative flex items-end max-w-4xl mx-auto w-full">
          <div className="relative w-full flex bg-slate-800/80 backdrop-blur-xl hover:bg-slate-800 focus-within:bg-slate-800 border border-slate-700/50 hover:border-slate-600 focus-within:border-blue-500/50 shadow-2xl rounded-3xl transition-all duration-300 p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a science question... (Shift+Enter for new line)"
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none max-h-40 min-h-[56px] py-4 px-5 focus:outline-none focus:ring-0 font-inter text-[15px] leading-relaxed overflow-y-auto"
              disabled={isLoading}
              rows={1}
            />
            <div className="absolute right-3 bottom-3 flex items-center">
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:scale-95 shadow-lg shadow-blue-900/50 group"
              >
                <Send className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </form>
        <div className="text-center mt-4">
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">
            Clariq AI can make mistakes. Always verify important scientific facts.
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatContainer;
