export function formatSessionTranscript(session) {
  const messages = session?.messages || [];
  if (messages.length === 0) return '';
  const title = (session?.title || 'Session').trim();
  const body = messages
    .map((message) => {
      const who = message.sender === 'user' ? 'Student' : 'Clariq';
      return `${who}:\n${message.text || ''}`.trim();
    })
    .join('\n\n');
  return `${title}\n\n${body}`;
}

export async function copySessionTranscript(session) {
  const text = formatSessionTranscript(session);
  if (!text) return false;
  await navigator.clipboard.writeText(text);
  return true;
}
