// frontend/lib/nats.ts
import { connect, StringCodec, NatsConnection } from 'nats.ws'; // 👈 use 'nats.ws' no browser

type Sub = { unsubscribe: () => void };

export async function createNatsClient(opts?: { servers?: string; token?: string }) {
  const servers = opts?.servers ?? (process.env.NEXT_PUBLIC_NATS_WS ?? 'ws://localhost:9222');
  const token = opts?.token;

  const nc = await connect({
    servers,
    token,
  });

  const sc = StringCodec();

  return {
    async pub(subject: string, data?: any) {
      const payload = data === undefined ? undefined : sc.encode(JSON.stringify(data));
      nc.publish(subject, payload);
    },
    async sub(subject: string, cb: (msg: any) => void): Promise<Sub> {
      const sub = nc.subscribe(subject);
      (async () => {
        for await (const m of sub) {
          const txt = sc.decode(m.data);
          try { cb(JSON.parse(txt)); } catch { cb(txt); }
        }
      })();
      return { unsubscribe: () => sub.unsubscribe() };
    },
    async close() { await nc.drain(); },
  };
}
