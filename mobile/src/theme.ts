export const colors = {
  canvas: '#07141c',
  card: '#102833',
  ink: '#e7f6f2',
  muted: '#8eaea8',
  faint: '#5d7a76',
  accent: '#2ee6c5',
  danger: '#fb7185',
  warn: '#fbbf24',
  border: '#1c3d4a',
};

export function masteryTone(mastery: number, confused?: boolean) {
  if (confused) return colors.danger;
  if (mastery >= 0.7) return colors.accent;
  if (mastery >= 0.45) return colors.warn;
  return '#94a3b8';
}
