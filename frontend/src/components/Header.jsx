import React, { useState } from 'react';
import { 
  PanelLeftClose, 
  PanelLeft, 
  ChevronDown, 
  Sparkles, 
  Zap, 
  BrainCircuit, 
  Check, 
  Plus, 
  Settings,
  Database
} from 'lucide-react';
import { Button, Badge, Dropdown } from '@/components/ui';

const Header = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  onNewChat, 
  activeModel, 
  setActiveModel,
  onOpenSettings
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const models = [
    {
      id: 'qwen-socratic',
      name: 'Clariq Socratic (Qwen 2.5 7B)',
      description: 'Pedagogical guidance using step-by-step Socratic questioning.',
      icon: Sparkles,
      tag: 'Fine-Tuned',
      badgeVariant: 'indigo'
    },
    {
      id: 'rag-fast',
      name: 'Fast Science RAG',
      description: 'Quick factual retrieval grounded directly in Grade 10 Science curriculum.',
      icon: Zap,
      tag: 'Fast',
      badgeVariant: 'emerald'
    },
    {
      id: 'deep-reasoning',
      name: 'Deep Concept Explorer',
      description: 'Detailed breakdown of complex multi-concept scientific problems.',
      icon: BrainCircuit,
      tag: 'Pro',
      badgeVariant: 'purple'
    }
  ];

  const selectedModel = models.find(m => m.id === activeModel) || models[0];

  return (
    <header className="h-14 px-3 sm:px-4 border-b border-white/10 flex items-center justify-between bg-[#171717]/90 backdrop-blur-md sticky top-0 z-30 select-none">
      
      {/* Left controls: Sidebar toggle & Model selection */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
        {/* Toggle Sidebar Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-label={isSidebarOpen ? "Close navigation sidebar" : "Open navigation sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" aria-hidden="true" />
          ) : (
            <PanelLeft className="w-5 h-5" aria-hidden="true" />
          )}
        </Button>

        {/* Model Selector Dropdown */}
        <Dropdown
          isOpen={isModelDropdownOpen}
          onClose={() => setIsModelDropdownOpen(false)}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              aria-expanded={isModelDropdownOpen}
              aria-haspopup="true"
              aria-label={`Select AI Model mode. Currently selected: ${selectedModel.name}`}
              className="px-2.5 py-1.5 font-outfit font-semibold text-zinc-100 text-xs sm:text-sm tracking-tight flex items-center space-x-1.5 sm:space-x-2 max-w-[200px] sm:max-w-xs"
            >
              <span className="truncate">{selectedModel.name}</span>
              <Badge variant={selectedModel.badgeVariant} size="sm" className="hidden xs:inline-flex">
                {selectedModel.tag}
              </Badge>
              <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </Button>
          }
        >
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <p className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Select Model Mode</p>
          </div>
          <div className="space-y-1" role="menu">
            {models.map((model) => {
              const Icon = model.icon;
              const isSelected = model.id === activeModel;
              return (
                <button
                  key={model.id}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setActiveModel(model.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`w-full flex items-start space-x-3 p-2.5 rounded-xl transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isSelected 
                      ? 'bg-zinc-800 text-white' 
                      : 'hover:bg-zinc-800/60 text-zinc-200 hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-100">{model.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />}
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug line-clamp-2">
                      {model.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </Dropdown>
      </div>

      {/* Right controls: Status, New Chat quick action & Settings */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
        {/* RAG Active Badge */}
        <div className="hidden md:flex items-center">
          <Badge variant="emerald" size="md" dot pulse>
            <Database className="w-3.5 h-3.5 mr-1 inline-block" aria-hidden="true" />
            ChromaDB Ready
          </Badge>
        </div>

        {/* Quick New Chat Button */}
        {(!isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            title="New Chat"
            aria-label="Start new chat session"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
          </Button>
        )}

        {/* Settings button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Open tutor settings"
        >
          <Settings className="w-5 h-5" aria-hidden="true" />
        </Button>
      </div>

    </header>
  );
};

export default Header;
