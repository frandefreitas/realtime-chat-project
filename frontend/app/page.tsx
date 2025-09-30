export default function HomePage() {
  return (
    <main className="grid gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Bem-vindo!</h2>
        <p className="opacity-80">
          Este é um frontend em Next.js 15 para o backend Nest/Mongo/NATS que você enviou.
        </p>
        <ul className="list-disc pl-6 mt-3 opacity-80 text-sm">
          <li>Use <code>/login</code> ou <code>/register</code> para gerar o token JWT</li>
          <li>Acesse <code>/dashboard</code> e <code>/chat</code> (rotas protegidas por middleware)</li>
          <li>O chat usa HTTP (<code>POST /api/chat/send</code>) e opcionalmente NATS via WebSocket se configurado</li>
        </ul>
      </div>
    </main>
  );
}
