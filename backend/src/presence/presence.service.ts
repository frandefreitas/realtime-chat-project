import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, NatsConnection, StringCodec, Subscription } from 'nats';

@Injectable()
export class PresenceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PresenceService.name);
  private nc!: NatsConnection;
  private sub?: Subscription;
  private sc = StringCodec();

  private lastSeen = new Map<string, number>();
  private ONLINE_TTL = 30_000; // 30s

  async onModuleInit() {
    this.nc = await connect({ servers: process.env.NATS_URL ?? 'nats://localhost:4222' });

    // escuta heartbeats vindo do frontend
    this.sub = this.nc.subscribe('presence.heartbeat');
    (async () => {
      for await (const m of this.sub!) {
        try {
          const data = JSON.parse(this.sc.decode(m.data));
          if (data?.userId) this.beat(String(data.userId), Number(data?.ts ?? Date.now()));
        } catch {}
      }
    })();

    this.logger.log('PresenceService iniciado');
  }

  async onModuleDestroy() {
    try { await this.sub?.drain(); } catch {}
    try { await this.nc?.drain(); } catch {}
  }

  publishOnline(userId: string) {
    this.beat(userId);
  }

  publishOffline(userId: string) {
    this.markOffline(userId);
  }

  beat(userId: string, ts: number = Date.now()) {
    this.lastSeen.set(userId, ts);
  }

  markOffline(userId: string) {
    this.lastSeen.delete(userId);
  }

  isOnline(userId: string): boolean {
    const ts = this.lastSeen.get(userId);
    return !!ts && (Date.now() - ts) <= this.ONLINE_TTL;
  }
}
