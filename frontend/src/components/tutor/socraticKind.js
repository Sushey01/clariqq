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

const KNOWN_MOVES = new Set(['question', 'hint', 'explanation']);

export function resolveMoveKind(message, socraticMode = 'strict') {
  const declared = String(message?.move_type || '').toLowerCase();
  if (KNOWN_MOVES.has(declared)) return declared;
  return inferMoveKind(message?.text, socraticMode);
}

export function tutorMessageFromReply(data, fallbackText) {
  const message = {
    sender: 'ai',
    text: data?.answer || fallbackText || '',
  };
  if (data?.move_type) message.move_type = data.move_type;
  if (Array.isArray(data?.sources)) message.sources = data.sources;
  return message;
}
