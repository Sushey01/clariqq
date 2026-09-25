import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, PanelLeft, Plus, Settings } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import ModelSelect from './ModelSelect';
import ThemeToggle from '@/components/theme/ThemeToggle';

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
}) {
  const [modelOpen, setModelOpen] = useState(false);
  const status = STATUS[backendStatus] ?? STATUS.unknown;

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
      </div>

      <div className="flex items-center gap-2">
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
