import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Network, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Search, 
  BookOpen, 
  Layers,
  Atom,
  FlaskConical,
  Dna,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui';

const SUBJECT_META = {
  Physics: {
    title: 'Physics Concepts',
    icon: Atom,
    color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    description: 'Motion, forces, energy, light, electricity, and magnetism.',
  },
  Chemistry: {
    title: 'Chemistry Concepts',
    icon: FlaskConical,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Atoms, periodic table, chemical reactions, and stoichiometry.',
  },
  Biology: {
    title: 'Biology Concepts',
    icon: Dna,
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    description: 'Cell biology, genetics, DNA replication, and human systems.',
  },
  Earth: {
    title: 'Earth & Space Science',
    icon: Globe,
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    description: 'Water cycle, atmosphere, plate tectonics, and astronomy.',
  },
};

const PAGE_SIZE = 16; // 16 nodes per page when a specific subject is selected

export default function ConceptGraphVisualizer({ graphNodes = [], graphEdges = [] }) {
  const [activeSubject, setActiveSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const subjects = ['All', 'Physics', 'Chemistry', 'Biology', 'Earth'];

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubject, searchQuery]);

  // Filter nodes by search and subject
  const filteredNodes = useMemo(() => {
    return graphNodes.filter((node) => {
      const matchSub = activeSubject === 'All' || node.subject === activeSubject;
      const matchQuery =
        !searchQuery.trim() ||
        (node.name || node.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.chapter || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchSub && matchQuery;
    });
  }, [graphNodes, activeSubject, searchQuery]);

  const isAllMode = activeSubject === 'All';

  // Apply pagination only when specific subject selected
  const displayNodes = useMemo(() => {
    if (isAllMode) return filteredNodes; // Show all nodes stacked vertically when "All" is selected
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredNodes.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredNodes, isAllMode, currentPage]);

  const totalFiltered = filteredNodes.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE) || 1;

  // Group displayed nodes by subject
  const groupedDisplay = useMemo(() => {
    const groups = {};
    displayNodes.forEach((node) => {
      const subj = node.subject || 'Physics';
      if (!groups[subj]) groups[subj] = [];
      groups[subj].push(node);
    });
    return groups;
  }, [displayNodes]);

  const stats = useMemo(() => {
    const total = graphNodes.length || 135;
    const mastered = graphNodes.filter((n) => n.seen && n.m >= 0.7).length;
    const exploring = graphNodes.filter((n) => n.seen && n.m < 0.7 && !n.confused).length;
    const confused = graphNodes.filter((n) => n.confused).length;
    const unseen = total - (mastered + exploring + confused);
    return { total, mastered, exploring, confused, unseen };
  }, [graphNodes]);

  // Find prerequisite relationships for selected node
  const prerequisites = useMemo(() => {
    if (!selectedNode) return [];
    const directPrereqs = graphEdges
      .filter((e) => e.target === selectedNode.id)
      .map((e) => graphNodes.find((n) => n.id === e.source))
      .filter(Boolean);
    return directPrereqs;
  }, [selectedNode, graphEdges, graphNodes]);

  const leadsTo = useMemo(() => {
    if (!selectedNode) return [];
    const outgoing = graphEdges
      .filter((e) => e.source === selectedNode.id)
      .map((e) => graphNodes.find((n) => n.id === e.target))
      .filter(Boolean);
    return outgoing;
  }, [selectedNode, graphEdges, graphNodes]);

  const startItemNum = totalFiltered > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endItemNum = Math.min(currentPage * PAGE_SIZE, totalFiltered);

  return (
    <div className="space-y-6">
      {/* Overview Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[var(--n-border)] bg-slate-900/40">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Total SEE Concepts</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Grade 10 Curriculum</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="text-[10px] uppercase font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Mastered (m ≥ 0.7)
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{stats.mastered}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Strong retention</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="text-[10px] uppercase font-semibold text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> In Progress
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{stats.exploring}</div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">Actively practicing</div>
        </div>
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <div className="text-[10px] uppercase font-semibold text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Needs Focus
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{stats.confused}</div>
          <div className="text-[10px] text-rose-500/80 mt-0.5">Confusion detected</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 rounded-2xl bg-[#171717] border border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setActiveSubject(sub)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                activeSubject === sub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search concepts or units..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-zinc-900 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Unboxed Node Cards Grid */}
      {totalFiltered === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#171717] border border-white/5 space-y-2">
          <Network className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">No concepts found</p>
          <p className="text-xs text-zinc-400">Try adjusting your search query or subject filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDisplay).map(([subjKey, nodesList]) => {
            const meta = SUBJECT_META[subjKey] || {
              title: `${subjKey} Concepts`,
              icon: BookOpen,
              color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
              description: 'Curriculum concepts and units.',
            };
            const Icon = meta.icon;

            return (
              <div key={subjKey} className="space-y-3">
                {/* Subject Section Heading */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl border ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-outfit font-bold text-base text-white">{meta.title}</h3>
                      <p className="text-xs text-zinc-400">{meta.description}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-white/10">
                    {nodesList.length} concepts
                  </span>
                </div>

                {/* Grid of Concept Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {nodesList.map((node) => {
                    const isMastered = node.seen && node.m >= 0.7;
                    const isConfused = node.confused;
                    const isExploring = node.seen && !isMastered && !isConfused;
                    const isSelected = selectedNode?.id === node.id;

                    let borderClass = 'border-white/10 bg-[#212121] text-zinc-300 hover:border-white/30 hover:bg-[#282828]';
                    if (isConfused) {
                      borderClass = 'border-rose-500/40 bg-rose-500/10 text-rose-200';
                    } else if (isMastered) {
                      borderClass = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200';
                    } else if (isExploring) {
                      borderClass = 'border-amber-500/40 bg-amber-500/10 text-amber-200';
                    }
                    if (isSelected) {
                      borderClass += ' ring-2 ring-indigo-400 border-indigo-400';
                    }

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setSelectedNode(node)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[100px] shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${borderClass}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                            <span>{node.subject}</span>
                            {isMastered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            {isConfused && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                          </div>
                          <h4 className="font-outfit font-semibold text-sm text-zinc-100 group-hover:text-white line-clamp-2 leading-snug">
                            {node.name || node.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[11px] text-zinc-400">
                          <span className="truncate max-w-[130px]">{node.chapter || 'CDC Unit'}</span>
                          <span className="font-mono font-bold text-zinc-200">
                            {node.seen ? `${Math.round((node.m || 0.85) * 100)}%` : 'New'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Render Pagination Footer ONLY when a specific subject tab is selected */}
          {!isAllMode && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 px-1">
              <span className="text-xs text-zinc-400">
                Showing <span className="font-semibold text-zinc-200">{startItemNum}–{endItemNum}</span> of <span className="font-semibold text-zinc-200">{totalFiltered}</span> concepts
              </span>

              <div className="flex items-center space-x-2">
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

                <div className="flex items-center space-x-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
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
            </div>
          )}
        </div>
      )}

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="p-6 rounded-3xl border border-indigo-500/40 bg-[#171717] space-y-4 shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {selectedNode.subject}
                </span>
                <span className="text-xs text-zinc-400">Chapter: {selectedNode.chapter || 'CDC Unit'}</span>
              </div>
              <h3 className="text-xl font-outfit font-bold text-white mt-1.5">{selectedNode.name || selectedNode.title}</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase text-zinc-400 font-medium">Current Mastery</div>
                <div className="text-lg font-mono font-bold text-indigo-400">
                  {selectedNode.seen ? `${((selectedNode.m || 0.85) * 100).toFixed(0)}%` : 'New Topic'}
                </div>
              </div>
              <Link
                to={`/app/chat?prompt=Can you explain ${encodeURIComponent(selectedNode.name || selectedNode.title)} using a Socratic guiding question?`}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                Practice Topic <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Prerequisite & Leads-to Graph Connections */}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl border border-white/10 bg-zinc-900/80">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Prerequisite Concepts Needed First
              </div>
              {prerequisites.length > 0 ? (
                <div className="space-y-1.5">
                  {prerequisites.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedNode(p)}
                      className="w-full text-left text-xs p-2 rounded-xl bg-zinc-800 border border-white/10 hover:border-white/25 text-zinc-200 flex justify-between items-center transition-colors"
                    >
                      <span>{p.name || p.title}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{p.subject}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">Foundational concept (No prerequisites required).</p>
              )}
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-zinc-900/80">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Unlocks Next in Curriculum
              </div>
              {leadsTo.length > 0 ? (
                <div className="space-y-1.5">
                  {leadsTo.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setSelectedNode(l)}
                      className="w-full text-left text-xs p-2 rounded-xl bg-zinc-800 border border-white/10 hover:border-white/25 text-zinc-200 flex justify-between items-center transition-colors"
                    >
                      <span>{l.name || l.title}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{l.subject}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 italic">Advanced topic in Grade 10 sequence.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
