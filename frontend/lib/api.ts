// frontend/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api';

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

// ---------- AUTH ----------
export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handle<{ token: string }>(res);
}

// ---------- USERS ----------
export async function getUserById(userId: string, token: string) {
  const res = await fetch(`${API_BASE}/nats/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle<any>(res);
}

export async function getAllUsersWithPresence(token: string) {
  const res = await fetch(`${API_BASE}/nats/users-with-presence`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return handle<any[]>(res);
}

// ---------- CHAT ----------
export async function sendChatMessage(text: string, token: string) {
  const res = await fetch(`${API_BASE}/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });
  return handle<{ ok: true }>(res);
}

// (mantenha outros helpers daqui pra baixo se você usa)
