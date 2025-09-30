// backend/src/chat/chat.controller.ts
import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '@/auth/jwt.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async send(@Req() req: any, @Body('text') text: string) {
    const userId = req.user.sub;
    await this.chat.publishToNats({ text, userId, ts: Date.now() });
    return { ok: true };
  }
}
