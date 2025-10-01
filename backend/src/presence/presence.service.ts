// src/presence/presence.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BrokerClientService } from '@/broker/broker-client.service';

type OnlineUser = { username: string; lastSeen: number };

@Injectable()
export class PresenceService implements OnModuleInit {
  private online = new Map<string, OnlineUser>();
  private readonly ttlMs = 25_000;

  constructor(private readonly broker: BrokerClientService) {}

  async onModuleInit() {
    this.broker.subscribe('presence.heartbeat.*', (_topic, _payload, msg) => {
      const username = msg.subject.split('.').pop()!;
      this.online.set(username, { username, lastSeen: Date.now() });
    });

    this.broker.subscribe('presence.offline.*', (_topic, _payload, msg) => {
      const username = msg.subject.split('.').pop()!;
      this.online.delete(username);
    });

    setInterval(() => {
      const now = Date.now();
      for (const [k, u] of this.online) {
        if (now - u.lastSeen > this.ttlMs) this.online.delete(k);
      }
    }, 5_000);
  }

  listOnline(): OnlineUser[] {
    const now = Date.now();
    return [...this.online.values()].filter(u => now - u.lastSeen <= this.ttlMs);
  }

  isOnline(username: string): boolean {
    const u = this.online.get(username);
    return !!u && Date.now() - u.lastSeen <= this.ttlMs;
  }

  async publishOffline(username: string): Promise<void> {
    this.online.delete(username);
    this.broker.publish(`presence.offline.${username}`, { t: Date.now() });
  }
}
