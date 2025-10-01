'use client';
import { useEffect, useRef, useState } from 'react';
import { subscribeJSON } from '@/lib/nats';
import { sendChat, listHistory } from '@/lib/api';

export type ChatMsg = { from: string; to: string; text: string; ts: number };

export function useChat(me: string, peer?: string) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const seen = useRef<Set<string>>(new Set());

  // zera ao trocar de peer
  useEffect(() => {
    setMsgs([]);
    seen.current.clear();
  }, [peer]);

  // assina NATS (apenas recebe; quem publica é o BACKEND)
  useEffect(() => {
    if (!me) return;
    let sub: any;
    (async () => {
      sub = await subscribeJSON<ChatMsg>(`chat.direct.${me}.*`, (m) => {
        // filtra só a conversa atual
        if (!peer || (m.from !== peer && m.to !== peer)) return;
        const key = `${m.from}-${m.to}-${m.ts}`;
        if (!seen.current.has(key)) {
          seen.current.add(key);
          setMsgs((prev) => [...prev, m]);
        }
      });
    })();
    return () => sub?.unsubscribe();
  }, [me, peer]);

  // carrega histórico ao abrir a conversa
  useEffect(() => {
    if (!me || !peer) return;
    (async () => {
      const { msgs } = await listHistory(me, peer, 100);
      setMsgs(msgs);
      msgs.forEach((m) => seen.current.add(`${m.from}-${m.to}-${m.ts}`));
    })();
  }, [me, peer]);

  async function send(to: string, text: string) {
    const msg: ChatMsg = { from: me, to, text, ts: Date.now() };
    setMsgs((prev) => [...prev, msg]);
    await sendChat(msg);
  }

  return { msgs, send };
}
