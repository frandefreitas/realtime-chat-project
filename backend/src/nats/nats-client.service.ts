import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, headers } from 'nats';

type PublishAndWaitArgs =
  | { subject: string; data?: any; timeoutMs?: number; headers?: Record<string, string> }
  | [subject: string, data?: any, timeoutMs?: number];

@Injectable()
export class NatsClientService implements OnModuleInit, OnModuleDestroy {
  private nc!: NatsConnection;
  private sc = StringCodec();

  async onModuleInit() {
    this.nc = await connect({ servers: process.env.NATS_URL ?? 'nats://localhost:4222' });
  }

  async onModuleDestroy() {
    try {
      await this.nc?.drain();
    } catch {}
  }

  /** publish (fire-and-forget) */
  async publish(subject: string, data?: any, hdrs?: Record<string, string>) {
    const h = hdrs ? headers() : undefined;
    if (h) for (const [k, v] of Object.entries(hdrs!)) h.set(k, v);
    const payload = data === undefined ? undefined : this.sc.encode(JSON.stringify(data));
    this.nc.publish(subject, payload, h ? { headers: h } : undefined);
  }

  /** request (request/response) com timeout */
  async request<T = any>(subject: string, data?: any, timeoutMs = 5_000, hdrs?: Record<string, string>): Promise<T> {
    const h = hdrs ? headers() : undefined;
    if (h) for (const [k, v] of Object.entries(hdrs!)) h.set(k, v);
    const payload = data === undefined ? undefined : this.sc.encode(JSON.stringify(data));
    const msg = await this.nc.request(subject, payload, { timeout: timeoutMs, headers: h });
    const txt = this.sc.decode(msg.data || new Uint8Array());
    return txt ? (JSON.parse(txt) as T) : (undefined as unknown as T);
  }

  /**
   * publishAndWait — alias conveniente para request
   * Aceita:
   *  - objeto: { subject, data?, timeoutMs?, headers? }
   *  - parâmetros: (subject, data?, timeoutMs?)
   */
  async publishAndWait<T = any>(...args: PublishAndWaitArgs): Promise<T> {
    if (Array.isArray(args)) {
      const [subject, data, timeoutMs] = args;
      return this.request<T>(subject, data, timeoutMs);
    }
    const { subject, data, timeoutMs, headers: hdrs } = args;
    return this.request<T>(subject, data, timeoutMs ?? 5_000, hdrs);
  }
}
