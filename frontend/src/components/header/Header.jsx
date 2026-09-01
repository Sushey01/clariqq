import { useState } from 'react';
import { PanelLeft, Plus, Settings } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import ModelSelect from './ModelSelect';

const STATUS = {
  ok: { label: 'Backend ready', variant: 'emerald' },
  not_ready: { label: 'Model loading', variant: 'amber' },
  offline: { label: 'Backend offline', variant: 'rose' },
  unknown: { label: 'Checking backend', variant: 'zinc' },
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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[#212121] px-3">
      <div className="flex items-center gap-1">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            title="Open sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        <ModelSelect
          activeModel={activeModel}
          onChange={onModelChange}
          isOpen={modelOpen}
          onOpenChange={setModelOpen}
        />
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={status.variant} size="md" dot className="hidden sm:inline-flex">
          {status.label}
        </Badge>
        {!isSidebarOpen && (
          <Button variant="ghost" size="icon" onClick={onNewChat} title="New chat">
            <Plus className="h-5 w-5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onOpenSettings} title="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
