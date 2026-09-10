import { Download, Trash2 } from 'lucide-react';
import { Button, Card, Modal } from '@/components/ui';
import { SOCRATIC_MODES } from '@/constants/app';
import { useTheme } from '@/theme/ThemeProvider';

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
  const { theme, setTheme, typeSize, setTypeSize } = useTheme();
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
        <p className="text-sm font-semibold text-[var(--ink)]">Teaching style</p>
        {SOCRATIC_MODES.map((mode) => (
          <Card
            key={mode.id}
            hoverable
            onClick={() => onModeChange(mode.id)}
            variant={socraticMode === mode.id ? 'indigo' : 'default'}
            className="p-3"
          >
            <p className="text-xs font-semibold text-[var(--ink)]">{mode.title}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-muted)]">
              {mode.description}
            </p>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--ink)]">Appearance</p>
        <div className="flex gap-2">
          {['dark', 'light'].map((value) => (
            <Button
              key={value}
              variant={theme === value ? 'indigo' : 'secondary'}
              size="md"
              onClick={() => setTheme(value)}
              className="flex-1 capitalize"
            >
              {value}
            </Button>
          ))}
        </div>
        <p className="pt-2 text-xs font-semibold text-[var(--ink)]">Text size</p>
        <div className="flex gap-2">
          <Button
            variant={typeSize === 'default' ? 'indigo' : 'secondary'}
            size="md"
            className="flex-1"
            onClick={() => setTypeSize('default')}
          >
            Default
          </Button>
          <Button
            variant={typeSize === 'comfortable' ? 'indigo' : 'secondary'}
            size="md"
            className="flex-1"
            onClick={() => setTypeSize('comfortable')}
          >
            Comfortable
          </Button>
        </div>
      </div>

      <Card variant="glass">
        <p className="text-xs font-semibold text-[var(--ink)]">Backend</p>
        <p className="mt-1 font-mono text-xs text-[var(--ink-muted)]">
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
