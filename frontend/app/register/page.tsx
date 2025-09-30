'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE, registerUser } from '@/lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(''); // URL da imagem (string)
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !username || !email || !password) {
      setError('Preencha nome, usuário, e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      // Check if avatar is a File before appending
      if (typeof avatar === 'object' && avatar !== null && 'name' in avatar && 'type' in avatar) {
        formData.append('avatar', avatar as File);
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar');

      const { access_token } = data;
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `token=${access_token}; Path=/; SameSite=Lax${secure}`;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="grid gap-6">
      <h2 className="text-xl font-semibold">Registrar</h2>

      <form onSubmit={onSubmit} className="card grid gap-3 max-w-md">
        <input
          className="input"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <input
          className="input"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          className="input"
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setAvatar(e.target.files[0].name);
            }
          }}
        />

        <input
          className="input"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button className="btn" disabled={loading}>
          {loading ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
    </main>
  );
}
