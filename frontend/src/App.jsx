import React, { useState, useEffect, useCallback } from 'react';
import { Header, Sidebar, ChatContainer, SettingsModal } from '@/components';

const LOCAL_STORAGE_KEY = 'clariq_socratic_sessions_v1';

function App() {
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load sessions from localStorage:', e);
    }
    // Default initial session
    return [
      {
        id: 'session-default-1',
        title: 'Science Exploration',
        createdAt: Date.now(),
        messages: [
          {
            sender: 'ai',
            text: 'Hello! I am your **Clariq Socratic Science Tutor**. What topic would you like to explore today? We can dive into Physics, Chemistry, Biology, or Space Science.'
          }
        ]
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0]?.id || null;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeModel, setActiveModel] = useState('qwen-socratic');
  const [socraticMode, setSocraticMode] = useState('strict');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync sessions with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions to localStorage:', e);
    }
  }, [sessions]);

  // Keyboard shortcut: Ctrl + K for New Chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleCreateNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleCreateNewChat = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: []
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
  }, []);

  const handleDeleteSession = useCallback((id) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const freshSessionId = `session-${Date.now()}`;
        const freshSession = {
          id: freshSessionId,
          title: 'New Conversation',
          createdAt: Date.now(),
          messages: []
        };
        setActiveSessionId(freshSessionId);
        return [freshSession];
      }
      if (id === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  }, [activeSessionId]);

  const handleRenameSession = useCallback((id, newTitle) => {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, title: newTitle } : s))
    );
  }, []);

  const handleClearAllHistory = useCallback(() => {
    const freshId = `session-${Date.now()}`;
    const freshSession = {
      id: freshId,
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: []
    };
    setSessions([freshSession]);
    setActiveSessionId(freshId);
  }, []);

  const handleSendMessage = async (userQuery) => {
    if (!activeSessionId) return;

    // Update user message immediately
    const userMsg = { sender: 'user', text: userQuery };
    
    setSessions(prev =>
      prev.map(session => {
        if (session.id === activeSessionId) {
          const isFirstUserMsg = session.messages.filter(m => m.sender === 'user').length === 0;
          // Auto rename title based on first user query if still generic
          const updatedTitle = (isFirstUserMsg || session.title === 'New Conversation')
            ? userQuery.slice(0, 30) + (userQuery.length > 30 ? '...' : '')
            : session.title;

          return {
            ...session,
            title: updatedTitle,
            messages: [...session.messages, userMsg]
          };
        }
        return session;
      })
    );

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: userQuery, 
          session_id: activeSessionId,
          socratic_mode: socraticMode
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const aiMsg = { sender: 'ai', text: data.answer };

      setSessions(prev =>
        prev.map(session => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, aiMsg]
            };
          }
          return session;
        })
      );
    } catch (error) {
      console.error('API Error:', error);
      const fallbackMsg = {
        sender: 'ai',
        text: '⚠️ **Connection Note**: Unable to reach the local Clariq RAG FastAPI backend (`http://127.0.0.1:8000/api/chat`).\n\nPlease ensure your Python backend server is running!'
      };

      setSessions(prev =>
        prev.map(session => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages, fallbackMsg]
            };
          }
          return session;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#212121] text-zinc-100 overflow-hidden font-sans select-none">
      
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleCreateNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#212121]">
        {/* ChatGPT Top Header Bar */}
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onNewChat={handleCreateNewChat}
          activeModel={activeModel}
          setActiveModel={setActiveModel}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Chat Viewport */}
        <ChatContainer
          session={activeSession}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          socraticMode={socraticMode}
        />
      </div>

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        socraticMode={socraticMode}
        setSocraticMode={setSocraticMode}
        onClearHistory={handleClearAllHistory}
        activeSession={activeSession}
      />

    </div>
  );
}

export default App;
