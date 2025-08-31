import { useState } from "react";
import AuthCard from "../components/AuthCard";
import { TextField, PrimaryButton } from "../components/FormBits";
import { postForm } from "../utils/api";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("username", username);
      if (email) fd.append("email", email);
      fd.append("password", password);
      if (avatar) fd.append("avatar", avatar);

      await postForm("/auth/register", fd);
      window.location.href = "/login";
    } catch (e2) {
      setErr(e2.message || "Falha no cadastro");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Criar conta">
      <form onSubmit={onSubmit}>
        <TextField label="Nome" name="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" disabled={busy}/>
        <TextField label="Username" name="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="usuario" disabled={busy}/>
        <TextField label="Email (opcional)" name="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@mail.com" disabled={busy}/>
        <TextField label="Senha" type="password" name="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" disabled={busy}/>

        <label className="fileLbl">
          <span>Foto (avatar)</span>
          <input type="file" accept="image/*" onChange={e=>setAvatar(e.target.files?.[0] || null)} disabled={busy}/>
        </label>

        <PrimaryButton disabled={busy}>{busy ? "Criando..." : "Criar conta →"}</PrimaryButton>
        {err ? <p className="err">{err}</p> : null}
      </form>

      <p className="alt">
        <Link href="/login">Já tenho conta</Link>
      </p>

      <style jsx>{`
        .fileLbl { display: block; margin: 8px 0 18px; color: #374151; font-weight: 600; }
        input[type="file"] { display: block; margin-top: 8px; }
        .alt { text-align: center; margin-top: 18px; }
        .err { margin-top: 12px; color: #b91c1c; font-weight: 600; }
      `}</style>
    </AuthCard>
  );
}