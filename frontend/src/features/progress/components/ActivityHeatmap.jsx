const LEVELS = [
  'rgba(46, 230, 197, 0.08)',
  'rgba(46, 230, 197, 0.28)',
  'rgba(46, 230, 197, 0.5)',
  'rgba(46, 230, 197, 0.75)',
  '#2ee6c5',
];

function levelForCount(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

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
  const cols = columnsFromDays(days);
  const shown = compact ? cols.slice(-12) : cols;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[var(--n-faint)]">Practice streak</p>
          <p className="mt-1 font-outfit text-2xl">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
        <p className="text-xs text-[var(--n-muted)]">
          Longest {longestStreak} · {activeDays} active days
        </p>
      </div>
      <div className="mt-4 flex gap-[3px] overflow-x-auto pb-1">
        {shown.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <span
                key={cell.date}
                title={`${cell.date} · ${cell.count} ${cell.count === 1 ? 'turn' : 'turns'}`}
                className="block h-[11px] w-[11px] rounded-[2px]"
                style={{ background: LEVELS[levelForCount(cell.count)] }}
              />
            ))}
          </div>
        ))}
      </div>
      {days.every((item) => item.count === 0) ? (
        <p className="mt-3 text-xs" style={{ color: 'var(--n-muted)' }}>
          Take a signed-in turn to start a streak.
        </p>
      ) : null}
    </div>
  );
}
