import { useState } from "react";
import AuthCard from "../components/AuthCard";
import { TextField, Checkbox, PrimaryButton } from "../components/FormBits";
import { postJSON } from "../utils/api";
import Link from "next/link";

export default function LoginPage() {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stay, setStay] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await postJSON("/auth/login", { usernameOrEmail: userOrEmail, password, remember: stay });
      window.location.href = "/chat";
    } catch (e2) {
      setErr(e2.message || "Falha no login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title="Acesse sua conta" subtitle="Insira suas credenciais para fazer login">
      <form onSubmit={onSubmit}>
        <TextField label="E-mail ou Username" name="usernameOrEmail" value={userOrEmail} onChange={e=>setUserOrEmail(e.target.value)} placeholder="seu@email.com ou usuario" disabled={busy}/>
        <TextField label="Senha" type="password" name="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" disabled={busy}/>
        <Checkbox checked={stay} onChange={setStay} label="Continuar conectado" name="remember" disabled={busy}/>
        <PrimaryButton disabled={busy}>{busy ? "Acessando..." : "Acessar →"}</PrimaryButton>
        {err ? <p className="err">{err}</p> : null}
      </form>
      <p className="alt">
        <Link href="/register">Criar uma nova conta</Link>
      </p>

      <style jsx>{`
        .alt { text-align: center; margin-top: 18px; }
        .err { margin-top: 12px; color: #b91c1c; font-weight: 600; }
      `}</style>
    </AuthCard>
  );
}