'use client';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAllUsersWithPresence } from '@/lib/api';

type JwtPayload = { sub: string; username: string; iat: number; exp: number };

function getCookie(name: string) {
  return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1] ?? '';
}

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const token = getCookie('token');
      if (!token) throw new Error('Sem token');
      // valida por desencargo
      jwtDecode<JwtPayload>(token);
      const items = await getAllUsersWithPresence(token);
      setUsers(items);
    } catch (e: any) {
      setError(e.message ?? 'Falha ao carregar usuários');
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 12_000); // atualiza a cada 12s
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card">
      <h3 className="font-semibold mb-2">Usuários</h3>
      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      <ul className="text-sm space-y-1 max-h-64 overflow-auto pr-1">
        {users.length === 0 && <li>Carregando…</li>}
        {users.map((u) => (
          <li key={String(u.id ?? u._id ?? u.userId)}>
            <span className={`inline-block h-2 w-2 rounded-full mr-2 ${u.online ? 'bg-green-400' : 'bg-gray-400'}`} />
            {u.name ?? u.fullName ?? u.username ?? '(sem nome)'}
            {u.username && <span className="opacity-70"> (@{u.username})</span>}
          </li>
        ))}
      </ul>
      <p className="opacity-70 text-xs mt-2">Lista completa com status online em tempo real.</p>
    </div>
  );
}
