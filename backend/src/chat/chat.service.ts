import { Injectable } from '@nestjs/common';
import { NatsClientService } from '../nats/nats-client.service';

@Injectable()
export class ChatService {
  constructor(private readonly nats: NatsClientService) {}

  async publishToNats(msg: { text: string; userId: string; ts: number }) {
    await this.nats.publish('chat.messages', msg);
  }
}
