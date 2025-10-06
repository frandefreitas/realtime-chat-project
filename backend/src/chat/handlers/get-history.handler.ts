import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';

export interface GetHistoryCommand { a: string; b: string; limit?: number; before?: number; }
export interface GetHistoryResult { msgs: any[]; }

@Injectable()
export class GetHistoryHandler implements ICommandHandler<GetHistoryCommand, GetHistoryResult> {
  constructor(@InjectModel(Message.name) private readonly msgModel: Model<MessageDocument>) {}

  async execute(cmd: GetHistoryCommand): Promise<GetHistoryResult> {
    const q: any = { $or: [{ from: cmd.a, to: cmd.b }, { from: cmd.b, to: cmd.a }] };
    if (cmd.before) q.ts = { $lt: cmd.before };
    const msgs = await this.msgModel.find(q).sort({ ts: 1 }).limit(cmd.limit ?? 100).lean();
    return { msgs };
  }
}
