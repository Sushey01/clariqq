import React, { useState, useMemo } from 'react';
import { 
  SquarePen, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Sparkles, 
  User,
  SlidersHorizontal,
  MoreVertical
} from 'lucide-react';
import { Button, Input, Badge, Dropdown } from '@/components/ui';

const Sidebar = ({ 
  isOpen, 
  onClose,
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession, 
  onRenameSession,
  onOpenSettings
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Group sessions by date category
  const groupedSessions = useMemo(() => {
    const filtered = sessions.filter(s => 
      s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const sevenDaysAgo = today - 86400000 * 7;

    const groups = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: []
    };

    filtered.forEach(session => {
      const timestamp = session.createdAt || Date.now();
      if (timestamp >= today) {
        groups.Today.push(session);
      } else if (timestamp >= yesterday) {
        groups.Yesterday.push(session);
      } else if (timestamp >= sevenDaysAgo) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups.Older.push(session);
      }
    });

    return groups;
  }, [sessions, searchTerm]);

  const handleStartRename = (session, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (id, e) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(null);
    onDeleteSession(id);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Container */}
      <aside 
        aria-label="Conversation navigation sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#171717] border-r border-white/10 flex flex-col h-full transition-all duration-300 ease-in-out shrink-0 select-none ${
          isOpen 
            ? 'translate-x-0 opacity-100' 
            : '-translate-x-full md:-ml-[260px] opacity-0 pointer-events-none'
        }`}
      >
        
        {/* Top Action Header */}
        <div className="p-3 border-b border-white/5 space-y-2">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="font-outfit font-bold text-base text-zinc-100 tracking-tight leading-none">Clariq AI</h1>
                <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-0.5">Socratic Science Tutor</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              title="New chat"
              aria-label="Start new chat session"
            >
              <SquarePen className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>

          {/* New Chat Full Button */}
          <Button
            variant="secondary"
            size="lg"
            onClick={onNewChat}
            aria-label="Start new chat session (Ctrl + K)"
            className="w-full justify-between shadow-xs border border-white/10"
          >
            <div className="flex items-center space-x-2.5">
              <SquarePen className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <span>New chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-300 bg-zinc-900 border border-white/10 rounded">
              Ctrl K
            </kbd>
          </Button>

          {/* Search Input */}
          <Input
            icon={Search}
            placeholder="Search conversations..."
            aria-label="Search conversation history"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sessions Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4" aria-label="Past Chat Sessions">
          {Object.entries(groupedSessions).map(([groupTitle, groupSessions]) => {
            if (groupSessions.length === 0) return null;
            return (
              <div key={groupTitle} className="space-y-1">
                <div className="px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  {groupTitle}
                </div>
                <div className="space-y-0.5">
                  {groupSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const isEditing = editingId === session.id;
                    const isMenuOpen = activeMenuId === session.id;

                    return (
                      <div
                        key={session.id}
                        role="button"
                        tabIndex={0}
                        aria-selected={isActive}
                        aria-label={`Chat session: ${session.title || 'Untitled Session'}`}
                        onClick={() => onSelectSession(session.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectSession(session.id);
                          }
                        }}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                          isActive
                            ? 'bg-zinc-800 text-white font-medium shadow-sm'
                            : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} aria-hidden="true" />
                          
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTitle}
                              aria-label="Edit chat title"
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(session.id, e);
                                if (e.key === 'Escape') handleCancelRename(e);
                              }}
                              autoFocus
                              className="bg-zinc-900 text-white text-xs px-1.5 py-0.5 rounded border border-indigo-500 focus:outline-none w-full"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="truncate text-xs">{session.title || 'Untitled Session'}</span>
                          )}
                        </div>

                        {/* Actions 3-Dots Popover Menu */}
                        {isEditing ? (
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={(e) => handleSaveRename(session.id, e)}
                              className="p-1 hover:text-emerald-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded"
                              title="Save title"
                              aria-label="Save title"
                            >
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                            <button
                              onClick={handleCancelRename}
                              className="p-1 hover:text-rose-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400 rounded"
                              title="Cancel rename"
                              aria-label="Cancel rename"
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                              isOpen={isMenuOpen}
                              onClose={() => setActiveMenuId(null)}
                              width="w-36"
                              align="right"
                              trigger={
                                <button
                                  type="button"
                                  title="Chat options"
                                  aria-label={`Options for ${session.title}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(isMenuOpen ? null : session.id);
                                  }}
                                  className={`p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-opacity ${
                                    isMenuOpen ? 'opacity-100 bg-zinc-800' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                                  }`}
                                >
                                  <MoreVertical className="w-3.5 h-3.5" aria-hidden="true" />
                                </button>
                              }
                            >
                              <div className="py-1 space-y-0.5" role="menu">
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={(e) => handleStartRename(session, e)}
                                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors text-left"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                                  <span>Rename</span>
                                </button>

                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={(e) => handleDelete(session.id, e)}
                                  className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </Dropdown>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="text-center py-8 px-4 text-zinc-400 text-xs">
              No conversations yet.<br/>Start a new chat above!
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {/* Preferences Button */}
          <Button
            variant="ghost"
            size="md"
            onClick={onOpenSettings}
            aria-label="Open Socratic Tutor Preferences"
            className="w-full justify-start space-x-2.5 text-zinc-300 hover:text-white"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" aria-hidden="true" />
            <span>Socratic Preferences</span>
          </Button>

          {/* User Profile Info */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                <User className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-200 truncate">Science Student</p>
                <Badge variant="emerald" size="sm" dot pulse>
                  Active Session
                </Badge>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
