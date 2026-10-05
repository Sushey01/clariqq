export function masteryTone(m, confused) {
  if (confused) return '#fb7185';
  if (m >= 0.7) return '#2ee6c5';
  if (m >= 0.45) return '#fbbf24';
  return '#94a3b8';
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
