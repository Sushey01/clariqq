import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Sparkles, MessageSquare, ArrowRight, Lightbulb, CheckCircle2, Target, ShieldCheck, Zap, Info } from 'lucide-react';
import { PENDING_PROMPT_KEY } from '@/constants/app';
import { useChatSessions } from '@/hooks/useChatSessions';

const BASE_SUBJECTS = [
  {
    id: 'phys',
    subject: 'Physics',
    totalConcepts: 15,
    color: '#22d3ee',
    gradientFrom: '#22d3ee',
    gradientTo: '#0891b2',
    topics: 'Force, Energy, Optics',
    allConcepts: [
      "Force & Motion", "Work & Power", "Optics & Light", "Electricity",
      "Magnetism", "Gravity & Spacetime", "Wave Mechanics", "Sound Waves",
      "Heat & Temperature", "Thermodynamics", "Pressure & Fluids",
      "Simple Machines", "Kinematics", "Nuclear Intro", "Modern Physics"
    ],
  },
  {
    id: 'chem',
    subject: 'Chemistry',
    totalConcepts: 12,
    color: '#a855f7',
    gradientFrom: '#a855f7',
    gradientTo: '#7e22ce',
    topics: 'Reactions, Acids, Metals',
    allConcepts: [
      "Chemical Reactions", "Acids & Bases", "Metals & Non-Metals",
      "Periodic Table Trends", "Atomic Structure", "Chemical Bonding",
      "Stoichiometry", "Balancing Redox", "Organic Chemistry",
      "Solutions & Solubility", "Gas Laws", "Electrochemistry"
    ],
  },
  {
    id: 'bio',
    subject: 'Biology',
    totalConcepts: 15,
    color: '#10b981',
    gradientFrom: '#10b981',
    gradientTo: '#047857',
    topics: 'Genetics, Ecology, Organs',
    allConcepts: [
      "Genetics & DNA", "Cell Structure", "Organ Systems", "Ecology & Food Webs",
      "Photosynthesis", "Cellular Respiration", "Mitosis & Meiosis",
      "Human Digestive System", "Circulatory System", "Nervous System",
      "Hormones & Regulation", "Plant Reproduction", "Evolution & Adaptation",
      "Microbiology", "Biotechnology"
    ],
  },
  {
    id: 'earth',
    subject: 'Earth & Space',
    totalConcepts: 10,
    color: '#f59e0b',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
    topics: 'Plate Tectonics, Climate',
    allConcepts: [
      "Earth Layers & Crust", "Atmosphere & Weather", "Plate Subduction Zones",
      "Solar System Dynamics", "Ocean Currents & Tides", "Rock Cycle & Minerals",
      "Earthquakes & Volcanoes", "Climate Change & Carbon Cycle",
      "Star Life Cycle", "Cosmology & Big Bang"
    ],
  },
  {
    id: 'env',
    subject: 'Ecology',
    totalConcepts: 12,
    color: '#f43f5e',
    gradientFrom: '#f43f5e',
    gradientTo: '#be123c',
    topics: 'Ecosystems, Resources',
    allConcepts: [
      "Ecosystem Energy Flow", "Resource Conservation", "Biodiversity & Habitats",
      "Biogeochemical Cycles", "Population Ecology", "Pollution Control",
      "Forest Conservation", "Sustainable Agriculture", "Renewable Energy",
      "Waste Management", "Wildlife Protection", "Climate Mitigation"
    ],
  },
];

export default function StudentHubBarGraph() {
  const navigate = useNavigate();
  const { sessions, createChat } = useChatSessions();
  const [metric, setMetric] = useState('coverage'); // 'coverage' | 'score' | 'turns'
  const [selectedSubjectId, setSelectedSubjectId] = useState('phys');

  // Calculate dynamic progress directly from actual chat sessions
  const dynamicSubjectData = useMemo(() => {
    const counts = { phys: 0, chem: 0, bio: 0, earth: 0, env: 0 };

    sessions.forEach((s) => {
      const userMsgs = (s.messages || []).filter((m) => m.role === 'user').length;
      if (userMsgs === 0) return;

      const text = (s.title + ' ' + (s.messages || []).map((m) => m.text).join(' ')).toLowerCase();
      if (text.includes('physic') || text.includes('force') || text.includes('motion') || text.includes('optic') || text.includes('energy')) {
        counts.phys += userMsgs;
      } else if (text.includes('chem') || text.includes('acid') || text.includes('metal') || text.includes('react')) {
        counts.chem += userMsgs;
      } else if (text.includes('bio') || text.includes('cell') || text.includes('organ') || text.includes('gene')) {
        counts.bio += userMsgs;
      } else if (text.includes('earth') || text.includes('tectonic') || text.includes('space') || text.includes('climate')) {
        counts.earth += userMsgs;
      } else if (text.includes('ecol') || text.includes('food') || text.includes('resource') || text.includes('environment')) {
        counts.env += userMsgs;
      } else {
        // Distribute general turns evenly across active subjects
        counts.phys += Math.ceil(userMsgs / 3);
        counts.bio += Math.floor(userMsgs / 3);
      }
    });

    return BASE_SUBJECTS.map((sub) => {
      const turns = counts[sub.id] || 0;
      
      // Calculate covered concepts dynamically based on Socratic turns
      let coveredConcepts = 0;
      if (turns > 0) {
        coveredConcepts = Math.min(Math.max(1, turns + Math.floor(turns * 0.5)), sub.totalConcepts);
      }

      const score = Math.min(100, Math.round((coveredConcepts / sub.totalConcepts) * 100));
      const masteredList = sub.allConcepts.slice(0, coveredConcepts);
      const pendingList = sub.allConcepts.slice(coveredConcepts);

      return {
        ...sub,
        turns,
        coveredConcepts,
        score,
        masteredList,
        pendingList,
        status: score >= 80 ? 'Mastered' : score > 0 ? 'In Progress' : 'Not Started',
        advice: turns === 0
          ? `0 turns logged in ${sub.subject}. Start your first Socratic chat to unlock ${sub.allConcepts[0]}!`
          : `${coveredConcepts} of ${sub.totalConcepts} ${sub.subject} concepts unlocked! Chat about ${pendingList[0] || 'advanced topics'} to increase your level.`
      };
    });
  }, [sessions]);

  const activeSubject = dynamicSubjectData.find((s) => s.id === selectedSubjectId) || dynamicSubjectData[0];

  const totalUnlockedAcrossAll = dynamicSubjectData.reduce((acc, s) => acc + s.coveredConcepts, 0);
  const totalConceptsAcrossAll = dynamicSubjectData.reduce((acc, s) => acc + s.totalConcepts, 0);
  const overallMasteryPercent = Math.round((totalUnlockedAcrossAll / totalConceptsAcrossAll) * 100);

  const getMaxValue = () => {
    if (metric === 'score') return 100;
    if (metric === 'coverage') return 15;
    return Math.max(10, Math.max(...dynamicSubjectData.map((s) => s.turns)));
  };

  const getBarVal = (d) => {
    if (metric === 'score') return d.score;
    if (metric === 'coverage') return d.coveredConcepts;
    return d.turns;
  };

  const getBarLabel = (d) => {
    if (metric === 'score') return `${d.score}%`;
    if (metric === 'coverage') return `${d.coveredConcepts}/${d.totalConcepts}`;
    return `${d.turns} turns`;
  };

  const maxValue = getMaxValue();

  const handleLaunchChatForSubject = (subject, topicName) => {
    createChat();
    const queryTopic = topicName || subject.pendingList[0] || subject.allConcepts[0];
    try {
      sessionStorage.setItem(PENDING_PROMPT_KEY, `Explain ${queryTopic} in ${subject.subject} SOCRATICALLY.`);
    } catch {
      /* ignore */
    }
    navigate('/app/chat');
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-cyan-950/20 space-y-6 relative overflow-hidden">
      
      {/* Dynamic Ambient Background Glow */}
      <div 
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500"
        style={{ backgroundColor: activeSubject.color }}
      />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic Student Progress Tracker
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              🎯 80% Target Benchmark
            </span>
          </div>
          <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Dynamic Concept Coverage & Mastery
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Every turn you take in Socratic Chat unlocks concept nodes. As a new student, your bars grow dynamically with your active chats!
          </p>
        </div>

        {/* View Toggle Controls Pill */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold self-start lg:self-auto shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setMetric('coverage')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === 'coverage'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 Covered / Limit
          </button>
          <button
            type="button"
            onClick={() => setMetric('score')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === 'score'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 Mastery %
          </button>
          <button
            type="button"
            onClick={() => setMetric('turns')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === 'turns'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💬 Chat Turns
          </button>
        </div>
      </div>

      {/* New Student Welcome Notice Banner (If 0 turns across all subjects) */}
      {totalUnlockedAcrossAll === 0 && (
        <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-cyan-200 z-10 relative">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-cyan-300 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Welcome to your Clariq Socratic Hub!</p>
              <p className="text-cyan-200/80">You are starting fresh. Launch your first Socratic chat below to unlock your first science concept node!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleLaunchChatForSubject(activeSubject)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shrink-0 transition-all active:scale-95"
          >
            Start First Chat Turn
          </button>
        </div>
      )}

      {/* SVG Bar Graph Canvas */}
      <div className="relative pt-6 pb-2 z-10">
        <svg viewBox="0 0 700 230" className="w-full h-auto overflow-visible">
          <defs>
            {dynamicSubjectData.map((d) => (
              <linearGradient key={d.id} id={`grad-${d.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={d.gradientFrom} stopOpacity="0.95" />
                <stop offset="100%" stopColor={d.gradientTo} stopOpacity="0.6" />
              </linearGradient>
            ))}
          </defs>

          {/* Background Grid Guidelines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = 180 - (val / 100) * 150;
            const gridLabel = metric === 'score' ? `${val}%` : metric === 'coverage' ? `${Math.round((val / 100) * 15)}` : `${Math.round((val / 100) * maxValue)}`;
            return (
              <g key={val}>
                <line x1="45" y1={y} x2="685" y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
                <text x="35" y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-500">
                  {gridLabel}
                </text>
              </g>
            );
          })}

          {/* Target Curriculum Benchmark Limit Line (80%) */}
          <line x1="45" y1={180 - (80 / 100) * 150} x2="685" y2={180 - (80 / 100) * 150} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 5" opacity="0.65" />

          {/* Bars Rendering */}
          {dynamicSubjectData.map((d, idx) => {
            const barWidth = 60;
            const gap = 125;
            const x = 75 + idx * gap;
            const val = getBarVal(d);
            
            // Allow minimum bar height for visibility even at 0
            const displayVal = val === 0 ? (metric === 'score' ? 3 : 0.5) : val;
            const barHeight = Math.max(8, (displayVal / maxValue) * 150);
            const y = 180 - barHeight;
            const isSelected = selectedSubjectId === d.id;

            return (
              <g
                key={d.id}
                onMouseEnter={() => setSelectedSubjectId(d.id)}
                onClick={() => setSelectedSubjectId(d.id)}
                className="cursor-pointer transition-all duration-300 group"
              >
                {/* Outer Glow Halo */}
                <rect
                  x={x - 4}
                  y={y - 4}
                  width={barWidth + 8}
                  height={barHeight + 4}
                  rx="16"
                  fill={d.color}
                  opacity={isSelected ? 0.35 : 0.08}
                  className="transition-all duration-300"
                />

                {/* Main Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="12"
                  fill={`url(#grad-${d.id})`}
                  stroke={isSelected ? '#ffffff' : d.color}
                  strokeWidth={isSelected ? 2.5 : 1}
                  className="transition-all duration-300"
                />

                {/* Top Label Value */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className={`text-xs font-bold font-mono transition-all ${
                    isSelected ? 'fill-white text-sm font-extrabold' : 'fill-slate-300'
                  }`}
                >
                  {getBarLabel(d)}
                </text>

                {/* X-Axis Subject Name */}
                <text
                  x={x + barWidth / 2}
                  y="202"
                  textAnchor="middle"
                  className={`text-xs font-outfit font-semibold transition-all ${
                    isSelected ? 'fill-cyan-300 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {d.subject}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Subject Dynamic Concept Inspector Panel */}
      {activeSubject && (
        <div className="p-5 sm:p-6 rounded-3xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-2xl space-y-4 shadow-xl relative z-10 transition-all">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shadow-md shrink-0"
                style={{ backgroundColor: activeSubject.color }}
              />
              <div>
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  {activeSubject.subject}
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({activeSubject.topics})
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold">
                🎯 {activeSubject.coveredConcepts} / {activeSubject.totalConcepts} Concepts Covered
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                {activeSubject.score}% Mastery Limit
              </span>
            </div>
          </div>

          {/* Dynamic Progress Bar Track */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Curriculum Concept Completion</span>
              <span className="text-cyan-300 font-mono font-bold">
                {Math.round((activeSubject.coveredConcepts / activeSubject.totalConcepts) * 100)}% Complete
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${(activeSubject.coveredConcepts / activeSubject.totalConcepts) * 100}%`,
                  backgroundColor: activeSubject.color,
                }}
              />
            </div>
          </div>

          {/* Mastered vs Pending Concept Chips */}
          <div className="space-y-2 pt-1">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
              {activeSubject.masteredList.length > 0 ? 'Unlocked Concepts & Next Topics' : 'Topics Ready to Unlock'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Unlocked Concept Badges */}
              {activeSubject.masteredList.map((concept) => (
                <span
                  key={concept}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {concept}
                </span>
              ))}

              {/* Pending Concepts to Unlock via Chat */}
              {activeSubject.pendingList.slice(0, 3).map((concept) => (
                <button
                  key={concept}
                  type="button"
                  onClick={() => handleLaunchChatForSubject(activeSubject, concept)}
                  title={`Click to launch Socratic inquiry for ${concept}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs group"
                >
                  <Target className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Unlock: {concept}</span>
                  <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}

            </div>
          </div>

          {/* Recommendation & Launch Button Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Lightbulb className="w-4 h-4 text-cyan-300 shrink-0" />
              <span>{activeSubject.advice}</span>
            </div>

            <button
              type="button"
              onClick={() => handleLaunchChatForSubject(activeSubject)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat {activeSubject.subject} Socratic
            </button>
          </div>

        </div>
      )}

      {/* Dynamic Summary Footer Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10 text-xs relative z-10">
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Total Unlocked Nodes</p>
            <p className="font-bold text-white text-sm">{totalUnlockedAcrossAll} / {totalConceptsAcrossAll} Concepts</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Overall Mastery Level</p>
            <p className="font-bold text-emerald-300 text-sm">{overallMasteryPercent}% Completion</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Next Socratic Step</p>
            <p className="font-bold text-purple-300 text-sm">{activeSubject.pendingList[0] || 'Explore Station'}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
