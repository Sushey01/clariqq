import { Download, Trash2 } from 'lucide-react';
import { Button, Card, Modal } from '@/components/ui';
import { SOCRATIC_MODES } from '@/constants/app';

export default function SettingsModal({
  isOpen,
  onClose,
  socraticMode,
  onModeChange,
  onClearHistory,
  activeSession,
  backendStatus,
  backendDetail,
}) {
  const exportMarkdown = () => {
    if (!activeSession?.messages?.length) return;
    const content = activeSession.messages
      .map(
        (message) =>
          `### ${message.sender === 'user' ? 'Student' : 'Clariq'}\n${message.text}\n`
      )
      .join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSession.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      footer={
        <Button variant="secondary" size="md" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold text-zinc-100">Teaching style</p>
        {SOCRATIC_MODES.map((mode) => (
          <Card
            key={mode.id}
            hoverable
            onClick={() => onModeChange(mode.id)}
            variant={socraticMode === mode.id ? 'indigo' : 'default'}
            className="p-3"
          >
            <p className="text-xs font-semibold text-white">{mode.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">
              {mode.description}
            </p>
          </Card>
        ))}
      </div>

      <Card variant="glass">
        <p className="text-xs font-semibold text-zinc-200">Backend</p>
        <p className="mt-1 font-mono text-xs text-zinc-400">
          Status: {backendStatus}
          {backendDetail ? ` — ${backendDetail}` : ''}
        </p>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          size="md"
          className="flex-1 justify-center"
          onClick={exportMarkdown}
          disabled={!activeSession?.messages?.length}
        >
          <Download className="h-4 w-4" />
          Export chat
        </Button>
        <Button
          variant="danger"
          size="md"
          className="flex-1 justify-center"
          onClick={() => {
            if (window.confirm('Clear all chats on this device?')) {
              onClearHistory();
              onClose();
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
          Clear history
        </Button>
      </div>
    </Modal>
  );
}
