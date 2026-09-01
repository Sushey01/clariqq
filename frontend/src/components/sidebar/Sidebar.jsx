import { useMemo, useState } from 'react';
import { LogOut, PanelLeftClose, Search, SquarePen } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import SessionItem from './SessionItem';
import { groupSessions } from './groupSessions';

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  user,
  onLogout,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const grouped = useMemo(
    () => groupSessions(sessions, searchTerm),
    [sessions, searchTerm]
  );

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[260px] shrink-0 flex-col bg-[#171717] transition-transform duration-200 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        <div className="space-y-2 p-3">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="font-outfit text-sm font-semibold text-zinc-100">
              Clariq
            </span>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={onNewChat} title="New chat">
                <SquarePen className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="Close sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            onClick={onNewChat}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <SquarePen className="h-4 w-4" />
              New chat
            </span>
            <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              Ctrl K
            </kbd>
          </Button>

          <Input
            icon={Search}
            placeholder="Search chats"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-2">
          {Object.entries(grouped).map(([label, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={label}>
                <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  {label}
                </p>
                <div className="space-y-0.5">
                  {items.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === activeSessionId}
                      onSelect={onSelectSession}
                      onRename={onRenameSession}
                      onDelete={onDeleteSession}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3">
          <p className="truncate px-1 text-xs font-medium text-zinc-200">
            {user?.name || 'Student'}
          </p>
          <p className="truncate px-1 text-[11px] text-zinc-500">{user?.email}</p>
          <Button
            variant="ghost"
            size="md"
            onClick={onLogout}
            className="mt-2 w-full justify-start gap-2 text-zinc-400"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
    </>
  );
}
