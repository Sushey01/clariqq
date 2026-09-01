import { useCallback, useEffect, useState } from 'react';
import { sendChat } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { useChatSessions } from '@/hooks/useChatSessions';
import Header from '@/components/header/Header';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatView from '@/components/chat/ChatView';
import SettingsModal from '@/components/settings/SettingsModal';

function titleFromQuestion(question) {
  const trimmed = question.trim();
  return trimmed.length > 32 ? `${trimmed.slice(0, 32)}...` : trimmed;
}

export default function ChatPage() {
  const { user, logout } = useAuth();
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createChat,
    deleteSession,
    renameSession,
    clearAll,
    appendMessage,
    replaceMessages,
  } = useChatSessions();

  const health = useBackendHealth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModel, setActiveModel] = useState('clariq-socratic');
  const [socraticMode, setSocraticMode] = useState('strict');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        createChat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [createChat]);

  const askTutor = useCallback(
    async (question, { regenerate = false } = {}) => {
      if (!activeSessionId || !question.trim()) return;

      if (regenerate) {
        const withoutLastAi = [...(activeSession.messages || [])];
        if (withoutLastAi.at(-1)?.sender === 'ai') {
          withoutLastAi.pop();
        }
        replaceMessages(activeSessionId, withoutLastAi);
      } else {
        const isFirst =
          (activeSession.messages || []).filter((m) => m.sender === 'user')
            .length === 0;
        appendMessage(
          activeSessionId,
          { sender: 'user', text: question },
          isFirst || activeSession.title === 'New chat'
            ? titleFromQuestion(question)
            : undefined
        );
      }

      setIsLoading(true);
      try {
        const data = await sendChat({
          question,
          sessionId: activeSessionId,
          socraticMode,
        });
        appendMessage(activeSessionId, {
          sender: 'ai',
          text: data.answer,
        });
      } catch (error) {
        appendMessage(activeSessionId, {
          sender: 'ai',
          text: `Could not reach the Clariq API. ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      activeSession,
      activeSessionId,
      appendMessage,
      replaceMessages,
      socraticMode,
    ]
  );

  const lastUserText = [...(activeSession?.messages || [])]
    .reverse()
    .find((message) => message.sender === 'user')?.text;

  return (
    <div className="flex h-screen overflow-hidden bg-[#212121] font-sans text-zinc-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          if (window.innerWidth < 768) setSidebarOpen(false);
        }}
        onNewChat={createChat}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        user={user}
        onLogout={logout}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-[#212121]">
        <Header
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onNewChat={createChat}
          activeModel={activeModel}
          onModelChange={setActiveModel}
          onOpenSettings={() => setSettingsOpen(true)}
          backendStatus={health.status}
        />
        <ChatView
          session={activeSession}
          isLoading={isLoading}
          socraticMode={socraticMode}
          backendStatus={health.status}
          onSend={(text) => askTutor(text)}
          onRegenerate={() =>
            lastUserText && askTutor(lastUserText, { regenerate: true })
          }
        />
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        socraticMode={socraticMode}
        onModeChange={setSocraticMode}
        onClearHistory={clearAll}
        activeSession={activeSession}
        backendStatus={health.status}
        backendDetail={health.detail}
      />
    </div>
  );
}
