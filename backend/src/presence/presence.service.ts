// src/presence/presence.service.ts
import { Injectable } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';

type OnlineUser = { username: string; lastSeen: number };

@Injectable()
export class PresenceService {
  private online = new Map<string, OnlineUser>();
  private readonly ttlMs = 25_000;

  constructor(private readonly nats: NatsService) {
    this.nats.subscribeJSON<{ t: number }>('presence.heartbeat.*', (_m, ctx) => {
      const username = ctx.subject.split('.').pop()!;
      this.online.set(username, { username, lastSeen: Date.now() });
    });

    setInterval(() => {
      const now = Date.now();
      for (const [u, info] of this.online) {
        if (now - info.lastSeen > this.ttlMs) this.online.delete(u);
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
    await this.nats.publishJSON(`presence.offline.${username}`, { t: Date.now() });
  }
}
