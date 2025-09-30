let _p: Promise<import('nats.ws').NatsConnection> | null = null;

export async function getNatsClient() {
  if (typeof window === 'undefined') return null; // garante client-side
  if (_p) return _p;
  _p = (async () => {
    const { connect } = await import('nats.ws');
    const servers = process.env.NEXT_PUBLIC_NATS_WS || 'ws://localhost:9222';
    return connect({ servers });
  })();
  return _p;
}

export async function subString(subject: string, onMsg: (s: string) => void) {
  const nc = await getNatsClient();
  if (!nc) return null;
  const { StringCodec } = await import('nats.ws');
  const sc = StringCodec();
  const sub = nc.subscribe(subject);
  (async () => {
    for await (const m of sub) onMsg(sc.decode(m.data));
  })();
  return sub;
}

export async function subJSON<T>(subject: string, onMsg: (data: T) => void) {
  return subString(subject, (txt) => {
    try { onMsg(JSON.parse(txt)); } catch {}
  });
}

export async function pubJSON(subject: string, data: unknown) {
  const nc = await getNatsClient();
  if (!nc) return;
  const { StringCodec } = await import('nats.ws');
  const sc = StringCodec();
  nc.publish(subject, sc.encode(JSON.stringify(data)));
}
