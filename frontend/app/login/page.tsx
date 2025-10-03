'use client';
import { useState, useEffect } from 'react';
import { login } from '@/lib/api';
import { startPresenceHeartbeat } from '@/lib/presence';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const hasToken = document.cookie.split('; ').some(c => c.startsWith('token='));
    if (hasToken) router.replace('/dashboard');
    else setChecking(false);
  }, [router]);
  if (checking) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const { token } = await login({ username, password });
      document.cookie = `token=${token}; Path=/;`;
      document.cookie = `username=${encodeURIComponent(username)}; Path=/;`;
      startPresenceHeartbeat(username);
      router.push('/dashboard');
    } catch (error: any) {
      setErr(error?.message ?? 'Erro ao logar');
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-bold mb-4">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full px-3 py-2 rounded bg-white/5 border"
          placeholder="username" value={username}
          onChange={(e) => setUsername(e.target.value)} />
        <input type="password" className="w-full px-3 py-2 rounded bg-white/5 border"
          placeholder="senha" value={password}
          onChange={(e) => setPassword(e.target.value)} />
        {err && <div className="text-red-400 text-sm">{err}</div>}
        <button className="w-full py-2 rounded bg-green-600">Entrar</button>
      </form>
    </div>
  );
}
