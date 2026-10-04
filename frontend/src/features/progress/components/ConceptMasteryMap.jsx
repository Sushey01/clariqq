import { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Flame, 
  AlertTriangle, 
  Search, 
  Sparkles,
  Compass,
  ChevronLeft,
  ChevronRight,
  Grid
} from 'lucide-react';
import { Card, Badge, Input, Button } from '@/components/ui';
import TopicDetailModal from './TopicDetailModal';

const SUBJECT_LIST = ['All', 'Physics', 'Chemistry', 'Biology', 'Earth'];
const PAGE_SIZE = 9; // Clean 3x3 grid per page

export default function ConceptMasteryMap({ nodes = [] }) {
  const [activeSubject, setActiveSubject] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Compute node mastery status
  const nodeStatus = (node) => {
    if (node.confused) return 'needs-review';
    const score = node.accuracy !== undefined ? node.accuracy * 100 : (node.seen ? 85 : 0);
    if (score >= 85) return 'mastered';
    if (node.seen || score > 0) return 'in-progress';
    return 'unseen';
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(PAGE_SIZE);
  }, [activeSubject, statusFilter, searchTerm]);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const title = (node.title || node.name || node.id || '').toLowerCase();
      const subject = node.subject || 'General';
      const status = nodeStatus(node);

      const matchesSearch = title.includes(searchTerm.toLowerCase());
      const matchesSubject = activeSubject === 'All' || subject === activeSubject;
      const matchesStatus = statusFilter === 'All' || status === statusFilter;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [nodes, activeSubject, statusFilter, searchTerm]);

  const totalFiltered = filteredNodes.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1;

  // Paginated slice
  const paginatedNodes = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredNodes.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredNodes, currentPage]);

  // Overall statistics calculation
  const stats = useMemo(() => {
    const total = nodes.length;
    const mastered = nodes.filter((n) => nodeStatus(n) === 'mastered').length;
    const inProgress = nodes.filter((n) => nodeStatus(n) === 'in-progress').length;
    const needsReview = nodes.filter((n) => nodeStatus(n) === 'needs-review').length;
    const overallPct = total > 0 ? Math.round(((mastered + inProgress * 0.5) / total) * 100) : 0;

    return { total, mastered, inProgress, needsReview, overallPct };
  }, [nodes]);

  const startItemNum = totalFiltered > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endItemNum = Math.min(currentPage * PAGE_SIZE, totalFiltered);

  return (
    <div className="space-y-6">
      
      {/* Top Mastery Overview Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="glass" className="p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Overall Mastery</span>
          <p className="font-outfit font-bold text-2xl text-indigo-400">{stats.overallPct}%</p>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.overallPct}%` }} />
          </div>
        </Card>

        <Card variant="glass" className="p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Mastered Nodes</span>
          <p className="font-outfit font-bold text-2xl text-emerald-400">{stats.mastered}</p>
          <p className="text-[11px] text-emerald-500/80">≥85% score accuracy</p>
        </Card>

        <Card variant="glass" className="p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">In Progress</span>
          <p className="font-outfit font-bold text-2xl text-amber-400">{stats.inProgress}</p>
          <p className="text-[11px] text-amber-500/80">Active learning turns</p>
        </Card>

        <Card variant="glass" className="p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Needs Review</span>
          <p className="font-outfit font-bold text-2xl text-rose-400">{stats.needsReview}</p>
          <p className="text-[11px] text-rose-500/80">Flagged confusion</p>
        </Card>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#171717] border border-white/10">
        
        {/* Subject Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {SUBJECT_LIST.map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setActiveSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeSubject === subj
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-64">
          <Input
            icon={Search}
            placeholder="Search science concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Concept Nodes Grid Matrix (9 items per page) */}
      {totalFiltered === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#171717] border border-white/5 space-y-2">
          <Compass className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">No matching concepts found</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search or subject filters to explore more topics in the Grade 10 SEE curriculum.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedNodes.map((node) => {
              const status = nodeStatus(node);
              const title = node.title || node.name || node.id;
              const subject = node.subject || 'General';
              const score = node.accuracy !== undefined ? Math.round(node.accuracy * 100) : (node.seen ? 85 : 0);

              const badgeConfig = 
                status === 'mastered' 
                  ? { label: 'Mastered', variant: 'emerald', icon: CheckCircle2 }
                  : status === 'needs-review'
                    ? { label: 'Needs Review', variant: 'rose', icon: AlertTriangle }
                    : status === 'in-progress'
                      ? { label: 'In Progress', variant: 'amber', icon: Flame }
                      : { label: 'Not Started', variant: 'zinc', icon: Sparkles };

              const StatusIcon = badgeConfig.icon;

              return (
                <Card
                  key={node.id}
                  hoverable
                  onClick={() => setSelectedNode(node)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Concept topic: ${title}. Status: ${badgeConfig.label}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNode(node);
                    }
                  }}
                  className="p-4 flex flex-col justify-between min-h-[120px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                        {subject}
                      </span>
                      <Badge variant={badgeConfig.variant} size="sm">
                        <StatusIcon className="w-3 h-3 mr-1 inline-block" />
                        {badgeConfig.label}
                      </Badge>
                    </div>
                    <h4 className="font-outfit font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors">
                      {title}
                    </h4>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-3">
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Mastery</span>
                      <span className="font-mono">{score}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          status === 'mastered'
                            ? 'bg-emerald-500'
                            : status === 'needs-review'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Clean Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 px-1">
            <span className="text-xs text-zinc-400">
              Showing <span className="font-semibold text-zinc-200">{startItemNum}–{endItemNum}</span> of <span className="font-semibold text-zinc-200">{totalFiltered}</span> concepts
            </span>

            {totalPages > 1 && (
              <div className="flex items-center space-x-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  title="Previous page"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </Button>

                <div className="flex items-center space-x-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  title="Next page"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Topic Detail Popup Modal */}
      <TopicDetailModal
        isOpen={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        node={selectedNode}
      />
    </div>
  );
}
