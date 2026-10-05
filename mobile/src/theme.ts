export const colors = {
  canvas: '#070d17',
  surface: '#0f172a',
  surfaceLight: '#1e293b',
  card: '#111c2e',
  cardElevated: '#17243c',
  cardHover: '#1c2d4a',
  border: '#1e293b',
  borderLight: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.16)',
  borderGlow: 'rgba(34, 211, 238, 0.3)',

  ink: '#f8fafc',
  inkSecondary: '#e2e8f0',
  muted: '#94a3b8',
  faint: '#64748b',
  subtle: '#334155',

  accent: '#22d3ee',        // cyan-400
  accentDark: '#0891b2',    // cyan-600
  accentPurple: '#a855f7',  // purple-500 (chemistry & tutor)
  accentEmerald: '#10b981', // emerald-500 (biology & mastery)
  accentAmber: '#f59e0b',   // amber-500 (earth & alerts)
  accentRose: '#f43f5e',    // rose-500 (confusion / physics)

  danger: '#f43f5e',
  warn: '#f59e0b',
  success: '#10b981',
  info: '#38bdf8',
};

export const BENCH_ACCENT: Record<string, string> = {
  Physics: '#22d3ee',
  Chemistry: '#a855f7',
  Biology: '#10b981',
  Earth: '#f59e0b',
  physics: '#22d3ee',
  chemistry: '#a855f7',
  biology: '#10b981',
  earth: '#f59e0b',
};

export function masteryTone(mastery: number, confused?: boolean) {
  if (confused) return colors.danger;
  if (mastery >= 0.7) return colors.accentEmerald;
  if (mastery >= 0.45) return colors.accentAmber;
  return '#94a3b8';
}

export function masteryLabel(mastery: number, confused?: boolean) {
  if (confused) return 'Needs Review';
  if (mastery >= 0.7) return 'Mastered';
  if (mastery >= 0.45) return 'Practicing';
  return 'Emerging';
}
