import { useMemo } from 'react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function levelForCount(count) {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  return 3;
}

const LEVEL_STYLES = {
  0: 'bg-slate-800/70 border-slate-700/40 text-slate-500',
  1: 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300',
  2: 'bg-emerald-600 border-emerald-500 text-white shadow-xs',
  3: 'bg-emerald-400 border-emerald-300 text-black font-bold shadow-sm',
};

function columnsFromDays(days) {
  const cols = [];
  for (let i = 0; i < days.length; i += 7) {
    cols.push(days.slice(i, i + 7));
  }
  return cols;
}

export default function ActivityHeatmap({
  days = [],
  currentStreak = 0,
  longestStreak = 0,
  activeDays = 0,
  compact = false,
}) {
  const cols = useMemo(() => columnsFromDays(days), [days]);
  const shownCols = compact ? cols.slice(-12) : cols;

  // Generate Month Labels aligned to grid columns
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = '';

    shownCols.forEach((week, colIdx) => {
      const validDay = week.find((d) => d && d.date);
      if (validDay) {
        const dateObj = new Date(validDay.date);
        const monthName = dateObj.toLocaleString('default', { month: 'short' });
        if (monthName !== lastMonth) {
          labels.push({ colIdx, monthName });
          lastMonth = monthName;
        }
      }
    });

    return labels;
  }, [shownCols]);

  return (
    <div className="space-y-4">
      {/* Top Header & Streak Stats */}
      <div className="flex flex-wrap items-end justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--n-cyan)]">
            Practice Streak & Activity Contribution
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="font-outfit text-3xl font-bold text-white">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
            <span className="text-xs text-emerald-400 font-medium">Active streak</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-zinc-400">
          <span>Longest: <strong className="text-zinc-200">{longestStreak} days</strong></span>
          <span>•</span>
          <span>Total Active: <strong className="text-zinc-200">{activeDays} days</strong></span>
        </div>
      </div>

      {/* GitHub Style Heatmap Grid Container */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-block min-w-max">
          
          {/* Month Headers aligned with column offsets */}
          <div className="relative h-5 ml-[36px] mb-1 select-none">
            {monthLabels.map((lbl, idx) => (
              <span
                key={idx}
                style={{ left: `${lbl.colIdx * 15}px` }}
                className="absolute top-0 text-xs font-semibold text-zinc-300 tracking-wide"
              >
                {lbl.monthName}
              </span>
            ))}
          </div>

          <div className="flex items-start space-x-2">
            
            {/* Weekday Labels (Sun-Sat) */}
            <div className="flex flex-col space-y-[3px] text-[9px] font-mono text-zinc-400 pt-0.5 select-none">
              <span className="h-[12px] leading-[12px]">Sun</span>
              <span className="h-[12px] leading-[12px]">Mon</span>
              <span className="h-[12px] leading-[12px]">Tue</span>
              <span className="h-[12px] leading-[12px]">Wed</span>
              <span className="h-[12px] leading-[12px]">Thu</span>
              <span className="h-[12px] leading-[12px]">Fri</span>
              <span className="h-[12px] leading-[12px]">Sat</span>
            </div>

            {/* Heatmap Squares Columns */}
            <div className="flex gap-[3px]">
              {shownCols.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((cell) => {
                    const level = levelForCount(cell.count);
                    const styleClass = LEVEL_STYLES[level];

                    return (
                      <span
                        key={cell.date}
                        title={`${cell.date}: ${cell.count} Socratic ${cell.count === 1 ? 'turn' : 'turns'} taken`}
                        className={`block h-[12px] w-[12px] rounded-[3px] border transition-transform duration-150 hover:scale-125 cursor-pointer ${styleClass}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Bottom GitHub Style Color Intensity Scale Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-zinc-400">
        <p className="text-zinc-400">
          {days.every((item) => item.count === 0)
            ? 'Take a Socratic turn to record activity'
            : 'Hover over any day square to inspect turn counts'}
        </p>

        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
          <span>Less</span>
          <span className="w-3 h-3 rounded-[3px] border border-slate-700/40 bg-slate-800/70" title="0 turns (Not Active)" />
          <span className="w-3 h-3 rounded-[3px] border border-emerald-800/60 bg-emerald-950/80" title="1-2 turns (Low Activity)" />
          <span className="w-3 h-3 rounded-[3px] border border-emerald-500 bg-emerald-600" title="3-5 turns (Moderate Activity)" />
          <span className="w-3 h-3 rounded-[3px] border border-emerald-300 bg-emerald-400" title="6+ turns (High Activity)" />
          <span>More</span>
        </div>
      </div>

    </div>
  );
}
