import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { BrokerClientService } from '@/broker/broker-client.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';

export interface SendDirectCommand { from: string; to: string; text: string; }
export interface SendDirectResult { ok: true; }

@Injectable()
export class SendDirectHandler implements ICommandHandler<SendDirectCommand, SendDirectResult> {
  constructor(
    private readonly broker: BrokerClientService,
    @InjectModel(Message.name) private readonly msgModel: Model<MessageDocument>,
  ) {}

  async execute(cmd: SendDirectCommand): Promise<SendDirectResult> {
    const msg = { from: cmd.from, to: cmd.to, text: cmd.text, ts: Date.now() };
    await this.msgModel.create(msg);
    const subject = `chat.direct.${cmd.to}.${cmd.from}`;
    this.broker.publish(subject, msg);
    return { ok: true };
  }
}
