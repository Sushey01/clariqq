export function lastSentenceIsQuestion(text) {
  return /\?\s*$/.test((text || '').trim());
}

export function inferMoveKind(text, socraticMode = 'strict') {
  const question = lastSentenceIsQuestion(text);
  if (socraticMode === 'direct' && !question) return 'explanation';
  if (socraticMode === 'guided' && !question) return 'hint';
  if (question) return 'question';
  return 'explanation';
}
