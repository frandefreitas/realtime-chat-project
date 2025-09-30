export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api';

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

export async function login(input: { username: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<{ token: string }>(res);
}

export async function register(input: {
  name: string; username: string; email: string; password: string;
}) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<{ token: string }>(res);
}

export async function listOnline() {
  const res = await fetch(`${API_BASE}/presence/online`, { cache: 'no-store' });
  return handle<{ users: { id?: string; username?: string; lastSeen: number }[] }>(res);
}

export async function sendChat(input: { from: string; to: string; text: string }) {
  const res = await fetch(`${API_BASE}/chat/send`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handle<{ ok: true }>(res);
}

export async function listUsers() {
  const res = await fetch(`${API_BASE}/users`, { cache: 'no-store' });
  return handle<{ users: { username: string }[] | string[] }>(res);
}
