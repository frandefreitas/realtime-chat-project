import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { ChatService } from '../chat.service';

export interface SendDirectCommand { from: string; to: string; text: string; }
export interface SendDirectResult { ok: true; }

@Injectable()
export class SendDirectHandler implements ICommandHandler<SendDirectCommand, SendDirectResult> {
  constructor(private readonly chat: ChatService) {}

  async execute(cmd: SendDirectCommand): Promise<SendDirectResult> {
    await this.chat.sendDirect(cmd.from, cmd.to, cmd.text);
    return { ok: true };
  }
}
