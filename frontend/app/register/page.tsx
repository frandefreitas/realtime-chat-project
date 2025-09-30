'use client';
import { useState } from 'react';
import { register } from '@/lib/api';
import { startPresenceHeartbeat } from '@/lib/presence';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '',
  });
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  function upd<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const { token } = await register(form);
      document.cookie = `token=${token}; Path=/;`;
      document.cookie = `username=${encodeURIComponent(form.username)}; Path=/;`;
      startPresenceHeartbeat(form.username);
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e?.message ?? 'Erro ao registrar');
    }
  }

  // mantenha seu layout
  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-bold mb-4">Registrar</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full px-3 py-2 rounded bg-white/5 border" placeholder="nome"
          value={form.name} onChange={(e) => upd('name', e.target.value)} />
        <input className="w-full px-3 py-2 rounded bg-white/5 border" placeholder="username"
          value={form.username} onChange={(e) => upd('username', e.target.value)} />
        <input className="w-full px-3 py-2 rounded bg-white/5 border" placeholder="email"
          value={form.email} onChange={(e) => upd('email', e.target.value)} />
        <input type="password" className="w-full px-3 py-2 rounded bg-white/5 border" placeholder="senha"
          value={form.password} onChange={(e) => upd('password', e.target.value)} />
        {err && <div className="text-red-400 text-sm">{err}</div>}
        <button className="w-full py-2 rounded bg-green-600">Criar conta</button>
      </form>
    </div>
  );
}
