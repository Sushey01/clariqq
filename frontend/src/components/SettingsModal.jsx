import React from 'react';
import { 
  Trash2, 
  Download, 
  Sliders, 
  BrainCircuit, 
  Check, 
  Database
} from 'lucide-react';
import { Modal, Button, Card, Badge } from '@/components/ui';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  socraticMode, 
  setSocraticMode, 
  onClearHistory, 
  activeSession 
}) => {
  const modes = [
    {
      id: 'strict',
      title: 'Strict Socratic (Recommended)',
      desc: 'Never gives answers directly. Asks targeted follow-up questions to guide self-discovery.'
    },
    {
      id: 'guided',
      title: 'Guided Socratic',
      desc: 'Provides key scientific hints along with conceptual reflection questions.'
    },
    {
      id: 'direct',
      title: 'Detailed Solution + Reflection',
      desc: 'Explains the full solution first, then asks a check-for-understanding question.'
    }
  ];

  const handleExportMarkdown = () => {
    if (!activeSession || !activeSession.messages.length) return;
    const content = activeSession.messages
      .map(m => `### ${m.sender === 'user' ? 'Student' : 'Clariq Socratic AI'}\n${m.text}\n`)
      .join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.md`;
    a.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Socratic Tutor Settings"
      icon={Sliders}
      footer={
        <Button variant="indigo" size="md" onClick={onClose}>
          Done
        </Button>
      }
    >
      {/* Section 1: Pedagogical Mode */}
      <div className="space-y-3">
        <label className="font-outfit font-semibold text-zinc-100 flex items-center space-x-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400" />
          <span>Teaching Method</span>
        </label>
        <div className="space-y-2">
          {modes.map((mode) => (
            <Card
              key={mode.id}
              onClick={() => setSocraticMode(mode.id)}
              variant={socraticMode === mode.id ? 'indigo' : 'default'}
              hoverable
              className="p-3.5 flex items-start justify-between"
            >
              <div className="space-y-1">
                <p className="font-semibold text-xs text-white">{mode.title}</p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{mode.desc}</p>
              </div>
              {socraticMode === mode.id && (
                <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Section 2: System Status & Knowledge Base */}
      <Card variant="glass" className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Vector Database & Model Pipeline</span>
        </div>
        <div className="text-xs text-zinc-400 space-y-1 font-mono">
          <p>Model Engine: <span className="text-zinc-200">Qwen2.5-7B-Instruct (GGUF)</span></p>
          <p>Vector Store: <span className="text-zinc-200">ChromaDB Local Index</span></p>
          <p>Curriculum: <span className="text-emerald-400">Grade 10 Science (Physics, Chem, Bio)</span></p>
        </div>
      </Card>

      {/* Section 3: Conversation Management */}
      <div className="space-y-3 pt-2 border-t border-white/5">
        <label className="font-outfit font-semibold text-zinc-100 block">
          Manage Data & History
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportMarkdown}
            disabled={!activeSession || !activeSession.messages.length}
            className="flex-1 justify-center"
          >
            <Download className="w-4 h-4" />
            <span>Export Chat (.md)</span>
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all chat sessions?")) {
                onClearHistory();
                onClose();
              }
            }}
            className="flex-1 justify-center"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All History</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
