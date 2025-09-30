'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

type MyJwtPayload = {
  sub: string;
  username: string;
  name?: string;
  iat?: number;
  exp?: number;
};

function getCookie(name: string) {
  const match = document.cookie.split('; ').find(r => r.startsWith(name + '='));
  if (!match) return '';
  const value = match.split('=').slice(1).join('=');
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function sanitizeToken(raw: string) {
  return raw.replace(/Bearer\s+/i, '').replace(/"|"$/g, '');
}

function isLikelyJwt(token: string) {
  return /^[A-Za-z0-9-]+.[A-Za-z0-9-]+.[A-Za-z0-9-_]+$/.test(token);
}

export default function DashboardPage() {
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = getCookie('token');
    if (!raw) {
      setError('Não autenticado');
      return;
    }

    const t = sanitizeToken(raw);
    setToken(t);

    if (!isLikelyJwt(t)) {
      setError('Token inválido');
      return;
    }

    try {
      const payload = jwtDecode<MyJwtPayload>(t);
      if (payload.exp && Date.now() / 1000 >= payload.exp) {
        setError('Sessão expirada');
        return;
      }
      setName(payload.name || '');
      setUsername(payload.username || '');
    } catch {
      setError('Token inválido');
    }
  }, []);

  return (
    <main className="grid gap-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      {error && <p className="text-red-500">{error}</p>}
      {!error && (
        <div className="card grid gap-2">
          <p className="text-lg font-medium">
            Bem-vindo, <span className="text-yellow-300">{name || username || 'Usuário'}</span> 👋
          </p>
          <p className="opacity-80 text-sm">
            Acesse o Chat e se comunique com o pessoal.
          </p>
        </div>
      )}
      <a className="btn w-fit" href="/chat">Ir para o Chat</a>
    </main>
  );
}