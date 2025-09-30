// src/app/(auth)/chat/ChatBox.tsx  (ou onde ficar no teu projeto)
'use client';
import { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '@/lib/api';
import { createNatsClient } from '@/lib/nats';

function getCookie(name: string) {
  return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1] ?? '';
}

type Message = { me?: boolean; text: string; userId?: string; ts?: number };

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll sempre que mudar a lista
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  // Assinar NATS
  useEffect(() => {
    let closed = false;
    (async () => {
      const nats = await createNatsClient();
      if (!nats || closed) return;

      const sub = await nats.sub('chat.messages', (msg) => {
        // msg: { content, userId, roomId?, ts? }
        const text = typeof msg === 'string' ? msg : msg.content ?? '';
        setMessages(prev => [...prev, { text, userId: msg?.userId, ts: msg?.ts }]);
      });

      // cleanup
      return () => {
        closed = true;
        try { sub?.unsubscribe(); } catch {}
        nats?.close().catch(() => {});
      };
    })();

    return () => { closed = true; };
  }, []);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = getCookie('token');
    if (!token) { setError('Sem token'); return; }
    try {
      const text = input.trim();
      if (!text) return;
      await sendChatMessage(text, token);
      setMessages(prev => [...prev, { me: true, text }]);
      setInput('');
    } catch (e: any) {
      setError(e?.message ?? 'Falha ao enviar');
    }
  }

  return (
    <div className="card grid gap-3">
      <div ref={listRef} className="h-64 overflow-auto space-y-2 p-2 rounded-lg bg-white/5">
        {messages.length === 0 && <p className="opacity-60 text-sm">Sem mensagens ainda.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`text-sm ${m.me ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-1 rounded-xl ${m.me ? 'bg-white/20' : 'bg-white/10'}`}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={onSend} className="flex gap-2">
        <input
          className="input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Digite uma mensagem..."
        />
        <button className="btn" type="submit">Enviar</button>
      </form>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
