import { Injectable } from '@nestjs/common';
import { NatsService } from '../nats/nats.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    private readonly nats: NatsService,
    @InjectModel(Message.name) private readonly msgModel: Model<MessageDocument>,
  ) {}

  async sendDirect(from: string, to: string, text: string) {
    const msg = { from, to, text, ts: Date.now() };
    await this.msgModel.create(msg);
    const subject = `chat.direct.${to}.${from}`;
    await this.nats.publishJSON(subject, msg);
  }

  async history(a: string, b: string, limit = 100, before?: number) {
    const q: any = { $or: [{ from: a, to: b }, { from: b, to: a }] };
    if (before) q.ts = { $lt: before };
    return this.msgModel.find(q).sort({ ts: 1 }).limit(limit).lean();
  }
}
