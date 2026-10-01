import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { Activity, AuthResponse, AuthUser, ChatReply, LinkedStudent, Mastery, WeeklyReport } from '@/api/types';
import { clearAccessToken, getAccessToken } from '@/auth/storage';

function apiBase() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const host = hostUri.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8000`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://127.0.0.1:8000';
}

export const API_BASE = apiBase();

function authHeaders(extra: Record<string, string> = {}, withToken = true) {
  const headers = { ...extra };
  const token = withToken ? getAccessToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function isStaleTokenError(message: string) {
  return /invalid or expired token/i.test(message || '');
}

async function parseError(response: Response, rawText = '') {
  const text = rawText || '';
  try {
    const body = text ? JSON.parse(text) : await response.clone().json();
    if (Array.isArray(body.detail)) {
      return body.detail.map((item: { msg?: string }) => item.msg || JSON.stringify(item)).join(' ');
    }
    return body.detail || body.message || `Request failed (${response.status})`;
  } catch {
    if (text.trim()) return text.slice(0, 300);
    return `Request failed (${response.status})`;
  }
}

async function authGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

async function authPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

async function postChat(
  { question, sessionId, socraticMode }: { question: string; sessionId: string; socraticMode: string },
  withToken: boolean,
) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }, withToken),
    body: JSON.stringify({
      question,
      session_id: sessionId,
      socratic_mode: socraticMode,
    }),
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(await parseError(response, raw));
  if (!raw.trim()) throw new Error('Empty reply from the tutor API.');
  try {
    return JSON.parse(raw) as ChatReply;
  } catch {
    throw new Error('Tutor API returned a non-JSON reply.');
  }
}

export function sendChat(input: { question: string; sessionId: string; socraticMode: string }) {
  return postChat(input, true).catch((error: Error) => {
    if (!getAccessToken() || !isStaleTokenError(error.message)) throw error;
    clearAccessToken();
    return postChat(input, false);
  });
}

export function getAuthMe() {
  return authGet<AuthUser>('/api/auth/me');
}

export function demoLogin(role: 'student' | 'teacher' | 'parent') {
  return authPost<AuthResponse>('/api/auth/demo-login', { role });
}

export function signupWithEmail(body: { name: string; email: string; password: string }) {
  return authPost<AuthResponse>('/api/auth/signup', body);
}

export function loginWithEmail(body: { email: string; password: string }) {
  return authPost<AuthResponse>('/api/auth/login', body);
}

export function getProgress() {
  return authGet<Mastery[]>('/api/progress');
}

export function getWeeklyReport() {
  return authGet<WeeklyReport>('/api/reports/weekly');
}

export function getProgressActivity(weeks = 12) {
  return authGet<Activity>(`/api/progress/activity?weeks=${weeks}`);
}

export function getTeacherStudents() {
  return authGet<LinkedStudent[]>('/api/teacher/students');
}

export function getTeacherStudentWeekly(studentId: string) {
  return authGet<WeeklyReport>(`/api/teacher/students/${studentId}/weekly`);
}

export function getParentChild() {
  return authGet<LinkedStudent>('/api/parent/child');
}

export function getParentChildWeekly() {
  return authGet<WeeklyReport>('/api/parent/child/weekly');
}
