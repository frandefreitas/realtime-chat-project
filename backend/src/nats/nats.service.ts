import { Injectable, Logger } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Subscription } from 'nats';

@Injectable()
export class NatsService {
  private readonly logger = new Logger(NatsService.name);
  private nc?: NatsConnection;
  readonly sc = StringCodec();

  async connect(): Promise<NatsConnection> {
    if (this.nc) return this.nc;
    const servers = process.env.NATS_URL || 'nats://localhost:4222';
    this.logger.log(`Conectando ao NATS: ${servers}`);
    this.nc = await connect({ servers });
    this.logger.log(`NATS conectado: ${this.nc.getServer()}`);
    return this.nc;
  }

  async close() {
    if (!this.nc) return;
    await this.nc.drain();
    await this.nc.close();
    this.nc = undefined;
    this.logger.log('NATS fechado.');
  }

  async publishJSON(subject: string, payload: unknown): Promise<void> {
    const nc = await this.connect();
    nc.publish(subject, this.sc.encode(JSON.stringify(payload)));
  }

  async requestJSON<T = any>(
    subject: string,
    payload: unknown,
    timeoutMs = 8000,
  ): Promise<T> {
    const nc = await this.connect();
    const msg = await nc.request(
      subject,
      this.sc.encode(JSON.stringify(payload)),
      { timeout: timeoutMs },
    );
    const txt = this.sc.decode(msg.data);
    return txt ? (JSON.parse(txt) as T) : (undefined as unknown as T);
  }

  async subscribeJSON<T = any>(
    subject: string,
    handler: (data: T, ctx: { subject: string }) => void,
  ): Promise<Subscription> {
    const nc = await this.connect();
    const sub = nc.subscribe(subject);
    (async () => {
      for await (const m of sub) {
        try {
          const data = JSON.parse(this.sc.decode(m.data)) as T;
          handler(data, { subject: m.subject });
        } catch (e) {
          this.logger.warn(`Falha parse JSON em ${m.subject}: ${e}`);
        }
      }
    })();
    return sub;
  }
}
