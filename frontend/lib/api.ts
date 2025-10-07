export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api';

const TOKEN_KEY = 'access_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(tok?: string) {
  if (typeof window === 'undefined') return;
  if (tok) localStorage.setItem(TOKEN_KEY, tok);
}

async function ensureTokenReady(timeoutMs = 600) {
  if (typeof window === 'undefined') return;
  const start = Date.now();
  while (!getToken() && Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 30));
  }
}

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message || body?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return (body ?? ({} as any)) as T;
}

function authHeaders(extra?: Record<string, string>) {
  const tok = getToken();
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  if (tok) base['Authorization'] = `Bearer ${tok}`;
  return { ...(extra ?? {}), ...base };
}

export async function login(input: { username: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await handle<{ access_token?: string; token?: string }>(res);
  const tok = data.access_token ?? data.token ?? '';
  setToken(tok);
  return { token: tok };
}

export async function register(input: {
  name: string; username: string; email: string; password: string;
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await handle<{ access_token?: string; token?: string }>(res);
  const tok = data.access_token ?? data.token ?? '';
  setToken(tok);
  return { token: tok };
}

export async function me() {
  await ensureTokenReady();
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  return handle<{ sub: string; username?: string }>(res);
}

export async function listOnline() {
  await ensureTokenReady();
  const res = await fetch(`${API_BASE}/presence/online`, {
    cache: 'no-store',
    headers: authHeaders(),
  });
  return handle<{ users: { id?: string; username?: string; lastSeen: number }[] }>(res);
}

export async function sendChat(input: { from: string; to: string; text: string }) {
  await ensureTokenReady();
  const res = await fetch(`${API_BASE}/chat/send`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  return handle<{ ok: true }>(res);
}

export async function listUsers() {
  await ensureTokenReady();
  const res = await fetch(`${API_BASE}/users`, {
    cache: 'no-store',
    headers: authHeaders(),
  });
  return handle<{ users: { username: string }[] | string[] }>(res);
}

export async function listHistory(a: string, b: string, limit = 100) {
  await ensureTokenReady();
  const res = await fetch(`${API_BASE}/chat/history/${a}/${b}?limit=${limit}`, {
    cache: 'no-store',
    headers: authHeaders(),
  });
  return handle<{ msgs: { from: string; to: string; text: string; ts: number }[] }>(res);
}

export function isAuthenticated() {
  return !!getToken();
}

export function logoutFront() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}
