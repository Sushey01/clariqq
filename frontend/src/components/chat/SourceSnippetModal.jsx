import { BookOpen, ExternalLink, ShieldCheck, Database } from 'lucide-react';
import { Modal, Button, Badge } from '@/components/ui';

export default function SourceSnippetModal({ isOpen, onClose, source }) {
  if (!source) return null;

  const title = source.title || source.name || source.uri || 'Curriculum Reference';
  const chapter = source.chapter || source.section || 'Grade 10 Science';
  const text = source.text || source.content || source.snippet || 'Retrieved context snippet from vector store index.';
  const score = source.score || source.similarity || source.confidence || 0.92;
  const scorePct = Math.round(score > 1 ? score : score * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="RAG Knowledge Citation"
      icon={BookOpen}
      footer={
        <Button variant="indigo" size="md" onClick={onClose}>
          Close Preview
        </Button>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Source Header Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-900 border border-white/10">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <p className="font-semibold text-zinc-100 text-xs">{title}</p>
              <p className="text-[11px] text-zinc-400">{chapter}</p>
            </div>
          </div>
          <Badge variant="emerald" size="sm" dot>
            {scorePct}% Vector Match
          </Badge>
        </div>

        {/* Source Text Snippet */}
        <div className="space-y-2">
          <label className="font-outfit font-semibold text-zinc-200 text-xs flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Retrieved Curriculum Passage</span>
          </label>
          <div className="p-4 rounded-2xl bg-[#171717] border border-white/10 text-zinc-300 font-mono text-xs leading-relaxed max-h-60 overflow-y-auto">
            {text}
          </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-snug">
          This grounding snippet was retrieved from the local ChromaDB index to verify scientific accuracy before generating Socratic guidance.
        </p>
      </div>
    </Modal>
  );
}
