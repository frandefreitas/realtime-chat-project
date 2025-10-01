'use client';
import { useState } from 'react';
import { useChat } from '@/hooks/useChat';

export default function ChatBox({ me, peer }: { me: string; peer: string }) {
  const { msgs, send } = useChat(me, peer);
  const [text, setText] = useState('');

  async function onSend() {
    if (!text.trim() || !peer) return;
    await send(peer, text);
    setText('');
  }

  return (
    <div className="p-3 flex flex-col gap-2">
      <div className="flex-1 overflow-y-auto rounded bg-black/20">
        {msgs.map((m, i) => (
          <div key={`${m.from}-${m.ts}-${i}`} className="mb-2">
            <div className="text-xs opacity-60">
              {m.from === me ? 'você' : '@' + m.from}
            </div>
            <div className="inline-block bg-white/10 rounded px-2 py-1">
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-3 py-2 rounded bg-white/5 border"
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <button onClick={onSend} className="px-4 py-2 rounded bg-blue-600">
          Enviar
        </button>
      </div>
    </div>
  );
}
