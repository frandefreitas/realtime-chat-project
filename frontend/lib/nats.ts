import { connect, NatsConnection, StringCodec, Subscription } from 'nats.ws';

const sc = StringCodec();
let promise: Promise<NatsConnection> | null = null;

export function getNats(): Promise<NatsConnection> {
  if (!promise) {
    const servers =
      process.env.NEXT_PUBLIC_NATS_WS_URL || 'ws://localhost:9222';
    promise = connect({ servers });
  }
  return promise;
}

export async function publishJSON(subject: string, payload: unknown) {
  const nc = await getNats();
  nc.publish(subject, sc.encode(JSON.stringify(payload)));
}

export async function subscribeJSON<T = any>(
  subject: string,
  handler: (data: T) => void,
): Promise<Subscription> {
  const nc = await getNats();
  const sub = nc.subscribe(subject);
  (async () => {
    for await (const m of sub) {
      try { handler(JSON.parse(sc.decode(m.data))); } catch {}
    }
  })();
  return sub;
}
