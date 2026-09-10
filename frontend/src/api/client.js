import { getAccessToken } from '@/auth/storage';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function authHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseError(response, rawText = "") {
  const text = rawText || "";
  try {
    const body = text ? JSON.parse(text) : await response.clone().json();
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg || JSON.stringify(item)).join(' ');
    }
    return body.detail || body.message || `Request failed (${response.status})`;
  } catch {
    if (text.trim()) return text.slice(0, 300);
    return `Request failed (${response.status})`;
  }
}

export async function sendChat({ question, sessionId, socraticMode }) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      question,
      session_id: sessionId,
      socratic_mode: socraticMode,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(await parseError(response, raw));
  }
  if (!raw.trim()) {
    throw new Error('Empty reply from the tutor API.');
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Tutor API returned a non-JSON reply.');
  }
}

export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function getAuthConfig() {
  const response = await fetch(`${API_BASE}/api/auth/config`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function loginWithGoogle(idToken) {
  const response = await fetch(`${API_BASE}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function listMaterials() {
  const response = await fetch(`${API_BASE}/api/materials`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function uploadMaterial(file) {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${API_BASE}/api/materials`, {
    method: 'POST',
    headers: authHeaders(),
    body,
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function reindexMaterial(id) {
  const response = await fetch(`${API_BASE}/api/materials/${id}/index`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function deleteMaterial(id) {
  const response = await fetch(`${API_BASE}/api/materials/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}
