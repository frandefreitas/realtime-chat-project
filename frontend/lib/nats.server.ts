// src/lib/nats.ts
import { connect, StringCodec, NatsConnection, Subscription } from 'nats';

type NatsHelper = {
  nc: NatsConnection;
  sub: (subject: string, onMsg: (msg: any) => void) => Promise<Subscription>;
  close: () => Promise<void>;
  pub: (subject: string, payload: any) => void;
};

export async function createNatsClient(): Promise<NatsHelper | null> {
  const servers = process.env.NEXT_PUBLIC_NATS_WS ?? 'ws://localhost:9222';
  try {
    const nc = await connect({ servers });
    const sc = StringCodec();

    const sub = async (subject: string, onMsg: (msg: any) => void) => {
      const s = nc.subscribe(subject);
      (async () => {
        for await (const m of s) {
          try {
            const data = JSON.parse(sc.decode(m.data));
            onMsg(data);
          } catch {
            onMsg(sc.decode(m.data));
          }
        }
      })();
      return s;
    };

    const pub = (subject: string, payload: any) => {
      const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
      nc.publish(subject, sc.encode(data));
    };

    const close = async () => { await nc.drain(); await nc.close(); };

    return { nc, sub, pub, close };
  } catch (e) {
    console.error('Falha ao conectar no NATS WS:', e);
    return null;
  }
}
