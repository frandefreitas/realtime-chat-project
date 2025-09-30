'use client';
import { useEffect, useState } from 'react';
import { listOnline } from '@/lib/api';

export type OnlineUser = { username: string; lastSeen: number };

export function useOnlineUsers(pollMs = 10_000) {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  async function refresh() {
    try {
      const { users } = await listOnline();
      setUsers(
        users.map(u => ({
          username: (u as any).username ?? (u as any).id,
          lastSeen: u.lastSeen,
        })),
      );
    } catch {}
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  return users;
}
