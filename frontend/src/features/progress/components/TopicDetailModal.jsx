import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Flame } from 'lucide-react';
import { Modal, Button, Badge, Card } from '@/components/ui';

export default function TopicDetailModal({ isOpen, onClose, node }) {
  const navigate = useNavigate();

  if (!node) return null;

  const title = node.title || node.name || 'Science Concept';
  const subject = node.subject || 'General Science';
  const turns = node.turn_count || node.turns || (node.seen ? 8 : 0);
  const accuracy = node.accuracy !== undefined ? Math.round(node.accuracy * 100) : (node.seen ? 85 : 0);
  const confused = Boolean(node.confused);
  
  const status = confused 
    ? { label: 'Needs Review', variant: 'rose', icon: AlertTriangle }
    : accuracy >= 85 
      ? { label: 'Mastered', variant: 'emerald', icon: CheckCircle2 }
      : { label: 'In Progress', variant: 'amber', icon: Flame };

  const StatusIcon = status.icon;

  const handlePractice = () => {
    onClose();
    // Navigate to chat with pre-loaded prompt query
    const query = `Help me understand ${title} step-by-step using Socratic guidance.`;
    navigate('/app/chat', { state: { initialPrompt: query } });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Concept Mastery Analysis"
      icon={BookOpen}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="indigo" size="md" onClick={handlePractice}>
            <span>Practice This Topic</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Header Topic Banner */}
        <div className="p-4 rounded-2xl bg-[#171717] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
              {subject}
            </span>
            <Badge variant={status.variant} size="sm" dot>
              <StatusIcon className="w-3 h-3 mr-1 inline-block" />
              {status.label}
            </Badge>
          </div>
          <h3 className="font-outfit font-bold text-lg text-white">{title}</h3>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="glass" className="p-3.5 space-y-1">
            <p className="text-[11px] text-[var(--ink-muted)] uppercase tracking-wider">Mastery Score</p>
            <p className="font-outfit font-bold text-xl text-emerald-400">{accuracy}%</p>
          </Card>
          <Card variant="glass" className="p-3.5 space-y-1">
            <p className="text-[11px] text-[var(--ink-muted)] uppercase tracking-wider">Turns Taken</p>
            <p className="font-outfit font-bold text-xl text-indigo-300">{turns} turns</p>
          </Card>
        </div>

        {/* Diagnostic Insight */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Socratic Learning Insight</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            {confused
              ? 'You flagged confusion or missed a key concept step during previous turns. Practice recommended.'
              : accuracy >= 85
                ? 'Strong conceptual understanding! You correctly answered reflection prompts with high accuracy.'
                : 'Active progress recorded. Take a few more turns to lock in mastery.'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
