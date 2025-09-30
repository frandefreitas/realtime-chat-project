import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('send')
  async send(@Body() body: { from: string; to: string; text: string }) {
    await this.chat.sendDirect(body.from, body.to, body.text);
    return { ok: true };
  }
}
