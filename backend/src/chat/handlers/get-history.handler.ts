import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { ChatService } from '../chat.service';

export interface GetHistoryCommand { a: string; b: string; limit?: number; before?: number; }
export interface GetHistoryResult { msgs: any[]; }

@Injectable()
export class GetHistoryHandler implements ICommandHandler<GetHistoryCommand, GetHistoryResult> {
  constructor(private readonly chat: ChatService) {}

  async execute(cmd: GetHistoryCommand): Promise<GetHistoryResult> {
    const msgs = await this.chat.history(cmd.a, cmd.b, cmd.limit ?? 100, cmd.before);
    return { msgs };
  }
}
