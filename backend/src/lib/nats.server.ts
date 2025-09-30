import { connect, NatsConnection, StringCodec } from 'nats';

let _conn: NatsConnection | null = null;

export async function getNatsServer(): Promise<NatsConnection> {
  if (_conn) return _conn;
  _conn = await connect({
    servers: process.env.NATS_URL || 'nats://localhost:4222',
  });
  return _conn;
}

export async function pubJSON(subject: string, data: unknown) {
  const nc = await getNatsServer();
  const sc = StringCodec();
  nc.publish(subject, sc.encode(JSON.stringify(data)));
}
