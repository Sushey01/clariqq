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
  SlidersHorizontal
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';

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
    onDeleteSession(id);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] bg-[#171717] border-r border-white/10 flex flex-col h-full transition-transform duration-300 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        
        {/* Top Action Header */}
        <div className="p-3 border-b border-white/5 space-y-2">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white" />
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
            >
              <SquarePen className="w-5 h-5" />
            </Button>
          </div>

          {/* New Chat Full Button */}
          <Button
            variant="secondary"
            size="lg"
            onClick={onNewChat}
            className="w-full justify-between shadow-xs border border-white/5"
          >
            <div className="flex items-center space-x-2.5">
              <SquarePen className="w-4 h-4 text-indigo-400" />
              <span>New chat</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/10 rounded">
              Ctrl K
            </kbd>
          </Button>

          {/* Search Input */}
          <Input
            icon={Search}
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {Object.entries(groupedSessions).map(([groupTitle, groupSessions]) => {
            if (groupSessions.length === 0) return null;
            return (
              <div key={groupTitle} className="space-y-1">
                <div className="px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  {groupTitle}
                </div>
                <div className="space-y-0.5">
                  {groupSessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    const isEditing = editingId === session.id;

                    return (
                      <div
                        key={session.id}
                        onClick={() => onSelectSession(session.id)}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs transition-all ${
                          isActive
                            ? 'bg-zinc-800 text-white font-medium shadow-sm'
                            : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                          
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTitle}
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

                        {/* Actions (Rename & Delete) */}
                        {isEditing ? (
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={(e) => handleSaveRename(session.id, e)}
                              className="p-1 hover:text-emerald-400 transition-colors"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelRename}
                              className="p-1 hover:text-rose-400 transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 shrink-0 transition-opacity">
                            <button
                              onClick={(e) => handleStartRename(session, e)}
                              className="p-1 text-zinc-400 hover:text-white transition-colors"
                              title="Rename"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(session.id, e)}
                              className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
            <div className="text-center py-8 px-4 text-zinc-500 text-xs">
              No conversations yet.<br/>Start a new chat above!
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {/* Preferences Button */}
          <Button
            variant="ghost"
            size="md"
            onClick={onOpenSettings}
            className="w-full justify-start space-x-2.5 text-zinc-400 hover:text-zinc-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
            <span>Socratic Preferences</span>
          </Button>

          {/* User Profile Info */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-white/5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
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
