import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="py-3 max-w-3xl mx-auto w-full flex items-center space-x-3 px-4 md:px-0">
      {/* Socratic Avatar Icon */}
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 border border-white/10" aria-hidden="true">
        <Sparkles className="w-4 h-4 animate-spin" />
      </div>

      {/* Modern 3-Dots Typing Indicator Pill */}
      <div className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-zinc-800/90 border border-white/10 shadow-md text-xs text-zinc-300">
        <span className="font-medium text-zinc-200 mr-1">Clariq is thinking</span>
        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
      </div>
    </div>
  );
}
