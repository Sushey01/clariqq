const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function parseError(response) {
  try {
    const body = await response.json();
    return body.detail || body.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function sendChat({ question, sessionId, socraticMode }) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      session_id: sessionId,
      socratic_mode: socraticMode,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}
