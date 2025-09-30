'use client';
import { useEffect, useState } from 'react';
import { listUsers, listOnline } from '@/lib/api';

type Props = {
  me: string;
  selected?: string;
  onSelect: (user: { username: string; online: boolean }) => void;
};

export default function UserList({ me, selected, onSelect }: Props) {
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    async function loadAll() {
      const { users } = await listUsers();
      const list = Array.isArray(users)
        ? (typeof (users as any)[0] === 'string'
            ? (users as string[])
            : (users as any[]).map(u => u.username))
        : [];
      setAllUsers(list.filter(Boolean));
    }
    loadAll();
  }, []);

  useEffect(() => {
    async function refreshPresence() {
      const { users } = await listOnline();
      const online = users.map(u => (u as any).username ?? (u as any).id);
      setOnlineUsers(online);
    }
    refreshPresence();
    const id = setInterval(refreshPresence, 10_000);
    return () => clearInterval(id);
  }, []);

  const visibleOnline = onlineUsers.filter(u => u !== me);
  const offlineUsers = allUsers.filter(u => u !== me && !onlineUsers.includes(u));

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Online</h3>
      <ul>
        {visibleOnline.map(u => (
          <li
            key={u}
            className={`cursor-pointer p-1 rounded ${selected === u ? 'bg-blue-500/30' : ''}`}
            onClick={() => onSelect({ username: u, online: true })}
          >
            🟢 @{u}
          </li>
        ))}
        {visibleOnline.length === 0 && (
          <li className="opacity-60 text-sm">Ninguém online</li>
        )}
      </ul>

      <h3 className="font-semibold mt-4 mb-2">Offline</h3>
      <ul className="opacity-60">
        {offlineUsers.map(u => (
          <li
            key={u}
            className={`cursor-pointer p-1 rounded ${selected === u ? 'bg-gray-500/30' : ''}`}
            onClick={() => onSelect({ username: u, online: false })}
          >
            ⚪ @{u}
          </li>
        ))}
      </ul>
    </div>
  );
}
