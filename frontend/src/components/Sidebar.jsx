import React from 'react';
import { MessageSquare, Settings, Compass, BookOpen, PlusCircle, Hexagon } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-72 h-full bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] border border-slate-700/50 shadow-2xl p-5 relative overflow-hidden z-20">
      
      {/* Brand */}
      <div className="flex items-center space-x-3 mb-8 px-2">
        <Hexagon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
        <span className="font-outfit font-bold text-xl text-white tracking-wide">Clariq</span>
      </div>

      {/* New Chat Button */}
      <button className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-[1px] hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
        <div className="relative flex items-center justify-center space-x-2 bg-slate-950/40 backdrop-blur-md px-4 py-3 rounded-2xl group-hover:bg-transparent transition-all duration-300">
          <PlusCircle className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
          <span className="font-medium text-blue-100 group-hover:text-white text-sm transition-colors">New Session</span>
        </div>
      </button>

      {/* Navigation */}
      <nav className="mt-8 space-y-2 flex-1">
        <div className="px-3 mb-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exploration</p>
        </div>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 transition-all">
          <Compass className="w-5 h-5" />
          <span className="font-medium text-sm">Current Topic</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-all group">
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">Session History</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-all group">
          <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">Curriculum Map</span>
        </a>
      </nav>

      {/* Settings */}
      <div className="mt-auto pt-6 border-t border-slate-700/50">
        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-all group">
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-medium text-sm">Settings</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
