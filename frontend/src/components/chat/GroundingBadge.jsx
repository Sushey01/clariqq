import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import SourceSnippetModal from './SourceSnippetModal';

export default function GroundingBadge({ source, index }) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!source) return null;

  const label = typeof source === 'string'
    ? source
    : source.title || source.name || source.uri || `Curriculum Source ${index + 1}`;
  
  const score = typeof source === 'object' && source.score ? Math.round(source.score * 100) : 92;

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-[11px] font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        title="View Grounding Citation Details"
      >
        <BookOpen className="w-3 h-3 text-emerald-400 shrink-0" />
        <span className="truncate max-w-[180px]">{label}</span>
        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-200 font-mono">
          {score}%
        </span>
      </button>

      <SourceSnippetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        source={typeof source === 'object' ? source : { title: source }}
      />
    </>
  );
}
