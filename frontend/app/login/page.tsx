'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Preencha usuário e senha.');
      return;
    }

    setLoading(true);
    try {
      const { access_token } = await login(username, password);

      // Armazenando token (idealmente HttpOnly, mas segue padrão atual)
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `token=${access_token}; Path=/; SameSite=Lax${secure}`;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid gap-6">
      <h2 className="text-xl font-semibold">Entrar</h2>

      <form onSubmit={onSubmit} className="card grid gap-3 max-w-md">
        <input
          className="input"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          className="input"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button className="btn" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="text-sm opacity-80">
          Não tem conta?{' '}
          <a className="underline" href="/register">
            Registrar
          </a>
        </p>
      </form>
    </main>
  );
}
