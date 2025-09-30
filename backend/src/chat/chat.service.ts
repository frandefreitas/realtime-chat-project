import { Injectable } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class ChatService {
  constructor(private readonly nats: NatsService) {}

  async sendDirect(from: string, to: string, text: string) {
    const subject = `chat.direct.${to}.${from}`;
    await this.nats.publishJSON(subject, { from, to, text, ts: Date.now() });
  }
}
