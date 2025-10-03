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
    <aside className="h-[80vh] min-h-0 flex flex-col border-white/20 bg-black/20">
      <div className="shrink-0 p-4 pb-2">
        <div className="text-sm opacity-80">
          Logado como <span className="font-semibold">@{me}</span>
        </div>
        <h3 className="font-semibold mt-3">Online</h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll px-4 pb-4">
        <ul className="space-y-1">
          {visibleOnline.map(u => (
            <li
              key={u}
              role="button"
              tabIndex={0}
              onClick={() => onSelect({ username: u, online: true })}
              onKeyDown={(e) => e.key === 'Enter' && onSelect({ username: u, online: true })}
              className={`select-none cursor-pointer rounded px-2 py-1 flex items-center gap-2
                ${selected === u ? 'bg-blue-500/30' : 'hover:bg-white/5'}`}
            >
              <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
              <span>@{u}</span>
            </li>
          ))}
          {visibleOnline.length === 0 && (
            <li className="opacity-60 text-sm">Ninguém online</li>
          )}
        </ul>

        <h3 className="font-semibold mt-4 mb-2">Offline</h3>
        <ul className="space-y-1 opacity-80">
          {offlineUsers.map(u => (
            <li
              key={u}
              role="button"
              tabIndex={0}
              onClick={() => onSelect({ username: u, online: false })}
              onKeyDown={(e) => e.key === 'Enter' && onSelect({ username: u, online: false })}
              className={`select-none cursor-pointer rounded px-2 py-1 flex items-center gap-2
                ${selected === u ? 'bg-gray-500/30' : 'hover:bg-white/5'}`}
            >
              <span className="inline-block h-3 w-3 rounded-full bg-gray-400" />
              <span>@{u}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
