import React from 'react';
import ChatContainer from './components/ChatContainer';
import Sidebar from './components/Sidebar';
import { Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="flex h-screen bg-[#06080F] text-slate-100 overflow-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none mix-blend-screen" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex w-full h-full p-4 md:p-6 gap-6">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden relative">
          
          {/* Header */}
          <header className="px-8 py-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/50 z-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-white/10">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-outfit font-bold text-xl text-white tracking-wide">Socratic Engine</h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs text-slate-400 font-medium tracking-wide">qwen2.5:1.5b • RAG Active</span>
                </div>
              </div>
            </div>
          </header>

          <ChatContainer />
        </main>
      </div>
    </div>
  );
}

export default App;
