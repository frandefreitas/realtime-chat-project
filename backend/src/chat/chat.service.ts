import { Injectable } from '@nestjs/common';
import { BrokerClientService } from '@/broker/broker-client.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    private readonly broker: BrokerClientService,
    @InjectModel(Message.name) private readonly msgModel: Model<MessageDocument>,
  ) {}

  async sendDirect(from: string, to: string, text: string) {
    const msg = { from, to, text, ts: Date.now() };
    await this.msgModel.create(msg);

    const subject = `chat.direct.${to}.${from}`;
    this.broker.publish(subject, msg);
  }

  async history(a: string, b: string, limit = 100, before?: number) {
    const q: any = { $or: [{ from: a, to: b }, { from: b, to: a }] };
    if (before) q.ts = { $lt: before };
    return this.msgModel.find(q).sort({ ts: 1 }).limit(limit).lean();
  }
}
