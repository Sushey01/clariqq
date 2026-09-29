import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Copy, LayoutGrid, PanelLeft, Plus, Settings } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import ModelSelect from './ModelSelect';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { copySessionTranscript } from '@/lib/sessionTranscript';

const STATUS = {
  ok: { label: 'Lab online', variant: 'emerald' },
  not_ready: { label: 'Model warming', variant: 'amber' },
  offline: { label: 'Lab offline', variant: 'rose' },
  unknown: { label: 'Checking lab', variant: 'zinc' },
};

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  onNewChat,
  activeModel,
  onModelChange,
  onOpenSettings,
  backendStatus,
  session,
}) {
  const [modelOpen, setModelOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = STATUS[backendStatus] ?? STATUS.unknown;
  const canCopy = (session?.messages || []).length > 0;

  const copySession = async () => {
    const ok = await copySessionTranscript(session);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <header className="lab-header sticky top-0 z-30 flex h-14 items-center justify-between px-3">
      <div className="flex items-center gap-1">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            title="Open lab log"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="hidden px-2 sm:block">
          <p className="font-outfit text-sm font-semibold">The desk</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">2D Socratic thread</p>
        </div>
        <ModelSelect
          activeModel={activeModel}
          onChange={onModelChange}
          isOpen={modelOpen}
          onOpenChange={setModelOpen}
        />
        <Link
          to="/app"
          className="hidden items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] sm:inline-flex"
        >
          <LayoutGrid className="h-4 w-4" />
          Lab floor
        </Link>
        <Link
          to="/app/progress"
          className="hidden rounded-lg px-2 py-1 text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] sm:inline-flex"
        >
          Progress
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canCopy}
          onClick={copySession}
          title="Copy this whole session"
          className="hidden px-2 py-1 sm:inline-flex"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="text-[11px]">{copied ? 'Copied session' : 'Copy session'}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!canCopy}
          onClick={copySession}
          title="Copy this whole session"
          className="sm:hidden"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Badge variant={status.variant} size="md" dot className="hidden sm:inline-flex">
          {status.label}
        </Badge>
        {!isSidebarOpen && (
          <Button variant="ghost" size="icon" onClick={onNewChat} title="New path">
            <Plus className="h-5 w-5" />
          </Button>
        )}
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={onOpenSettings} title="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
