import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthUser } from '@/api/types';

const TOKEN_KEY = 'clariq_access_token_v1';
const SESSION_KEY = 'clariq_session_v1';

let memoryToken: string | null = null;

async function read(key: string) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function write(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function remove(key: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export function getAccessToken() {
  return memoryToken;
}

export async function loadAccessToken() {
  memoryToken = await read(TOKEN_KEY);
  return memoryToken;
}

export async function saveAccessToken(token: string) {
  memoryToken = token;
  await write(TOKEN_KEY, token);
}

export function clearAccessToken() {
  memoryToken = null;
  void remove(TOKEN_KEY);
}

export async function loadSession(): Promise<AuthUser | null> {
  try {
    const raw = await read(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export async function saveSession(user: AuthUser) {
  await write(SESSION_KEY, JSON.stringify(user));
}

export async function clearSession() {
  await remove(SESSION_KEY);
}

export function publicUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'student',
  };
}
