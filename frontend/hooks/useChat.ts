'use client';
import { useEffect, useState } from 'react';
import { subscribeJSON, publishJSON } from '@/lib/nats';
import { sendChat } from '@/lib/api';

export type ChatMsg = { from: string; to: string; text: string; ts: number };

export function useChat(me: string) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);

  useEffect(() => {
    if (!me) return;
    let sub: any;
    (async () => {
      sub = await subscribeJSON<ChatMsg>(`chat.direct.${me}.*`, (m) => {
        if (m?.to === me) setMsgs(prev => [...prev, m]);
      });
    })();
    return () => sub?.unsubscribe();
  }, [me]);

  async function send(to: string, text: string) {
    const msg: ChatMsg = { from: me, to, text, ts: Date.now() };
    setMsgs(prev => [...prev, msg]); // otimista
    await sendChat(msg); // via REST
    await publishJSON(`chat.direct.${to}.${me}`, msg); // redundante opcional
  }

  return { msgs, send };
}
