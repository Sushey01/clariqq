import { useState } from 'react';
import { TrendingUp, BarChart2, Award, Calendar, Sparkles } from 'lucide-react';

const MONTHLY_DATA = [
  { month: 'Aug', score: 58, turns: 42, activeStudents: 3 },
  { month: 'Sep', score: 64, turns: 65, activeStudents: 3 },
  { month: 'Oct', score: 78, turns: 98, activeStudents: 3 },
  { month: 'Nov', score: 82, turns: 110, activeStudents: 3 },
  { month: 'Dec', score: 88, turns: 135, activeStudents: 3 },
];

export default function ClassPerformanceGraph() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // SVG dimensions
  const width = 600;
  const height = 180;
  const padding = 30;

  // Map scores (0-100) to Y coordinates
  const getY = (score) => height - padding - (score / 100) * (height - 2 * padding);
  const getX = (index) => padding + (index / (MONTHLY_DATA.length - 1)) * (width - 2 * padding);

  // Build smooth SVG path
  const points = MONTHLY_DATA.map((d, i) => `${getX(i)},${getY(d.score)}`);
  const pathD = `M ${points.join(' L ')}`;
  const areaD = `M ${getX(0)},${height - padding} L ${points.join(' L ')} L ${getX(MONTHLY_DATA.length - 1)},${height - padding} Z`;

  const activePoint = hoveredIndex !== null ? MONTHLY_DATA[hoveredIndex] : MONTHLY_DATA[2];

  return (
    <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl space-y-4 shadow-xl">
      {/* Graph Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Class Performance Analytics
          </div>
          <h3 className="font-outfit text-xl font-bold text-white">Monthly Concept Mastery & Practice Trend</h3>
          <p className="text-xs text-slate-400">Class 10 SEE Science concept accuracy over time.</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
            <span className="text-slate-300">Mastery Score %</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-slate-300">Passing Line (60%)</span>
          </div>
        </div>
      </div>

      {/* SVG Line Graph */}
      <div className="relative pt-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible">
          {/* Gradient Fill under the curve */}
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[20, 40, 60, 80, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                <text x={10} y={y + 4} fill="#64748b" fontSize="10" fontFamily="monospace">{val}%</text>
              </g>
            );
          })}

          {/* 60% Passing Threshold Line */}
          <line
            x1={padding}
            y1={getY(60)}
            x2={width - padding}
            y2={getY(60)}
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />

          {/* Area Fill */}
          <path d={areaD} fill="url(#cyanGradient)" />

          {/* Smooth Trend Line */}
          <path d={pathD} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {MONTHLY_DATA.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.score);
            const isHovered = hoveredIndex === i;

            return (
              <g key={d.month} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 5}
                  fill={isHovered ? '#67e8f9' : '#06b6d4'}
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
                {/* Month X-Axis Label */}
                <text x={cx} y={height - 8} fill="#94a3b8" fontSize="11" textAnchor="middle" fontWeight="bold">
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {activePoint && (
          <div className="mt-2 p-3 rounded-2xl border border-cyan-500/30 bg-slate-950/90 flex items-center justify-between text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">{activePoint.month} 2026 Snapshot:</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-cyan-300 font-mono font-bold">Mastery: {activePoint.score}%</span>
              <span className="text-emerald-400 font-mono font-bold">Socratic Turns: {activePoint.turns}</span>
              <span className="text-purple-300 font-mono font-bold">Active Students: {activePoint.activeStudents}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
