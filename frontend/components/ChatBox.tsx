'use client';
import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';

type Props = {
  me: string;
  peer: string;
  className?: string;
};

export default function ChatBox({ me, peer, className }: Props) {
  const { msgs, send } = useChat(me, peer);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  async function onSend() {
    if (!text.trim() || !peer) return;
    await send(peer, text);
    setText('');
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  return (
    <div className={`flex flex-col ${className ?? 'h-[80vh]'} p-3 flex-space-between`}>

      <div className="flex-1 overflow-y-auto rounded bg-black/20 p-3 space-y-3 custom-scroll">
        {msgs.map((m, i) => {
          const isMe = m.from === me;
          return (
            <div
              key={`${m.from}-${m.ts}-${i}`}
              className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
            >
              <div className="max-w-[70%]">
                <div className="text-xs opacity-60 mb-1">
                  {isMe ? 'você' : '@' + m.from}
                </div>

                <div
                  className={`relative px-3 py-2 rounded-lg break-words text-white ${
                    isMe
                      ? 'bg-blue-600 rounded-bl-none'
                      : 'bg-gray-700 rounded-br-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 mt-0 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-3 py-2 rounded bg-white/5 border border-gray-600 text-white outline-none focus:border-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
        />
        <button
          onClick={onSend}
          className="px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
