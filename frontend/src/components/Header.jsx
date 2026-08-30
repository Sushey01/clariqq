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
    <header className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-[#171717]/90 backdrop-blur-md sticky top-0 z-30 select-none">
      
      {/* Left controls: Sidebar toggle & Model selection */}
      <div className="flex items-center space-x-2">
        {/* Toggle Sidebar Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
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
              className="px-3 py-1.5 font-outfit font-semibold text-zinc-100 text-sm tracking-tight flex items-center space-x-2"
            >
              <span>{selectedModel.name}</span>
              <Badge variant={selectedModel.badgeVariant} size="sm">
                {selectedModel.tag}
              </Badge>
              <ChevronDown className={`w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
          }
        >
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Model Mode</p>
          </div>
          <div className="space-y-1">
            {models.map((model) => {
              const Icon = model.icon;
              const isSelected = model.id === activeModel;
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    setActiveModel(model.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`w-full flex items-start space-x-3 p-2.5 rounded-xl transition-all text-left ${
                    isSelected 
                      ? 'bg-zinc-800 text-white' 
                      : 'hover:bg-zinc-800/50 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-100">{model.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug line-clamp-2">
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
      <div className="flex items-center space-x-2">
        {/* RAG Active Badge */}
        <div className="hidden sm:flex items-center">
          <Badge variant="emerald" size="lg" dot pulse>
            <Database className="w-3.5 h-3.5 mr-1 inline-block" />
            ChromaDB Ready
          </Badge>
        </div>

        {/* Quick New Chat Button */}
        {(!isSidebarOpen || window.innerWidth < 768) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            title="New Chat"
          >
            <Plus className="w-5 h-5" />
          </Button>
        )}

        {/* Settings button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

    </header>
  );
};

export default Header;
