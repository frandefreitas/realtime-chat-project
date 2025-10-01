import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('send')
  async send(@Body() body: { from: string; to: string; text: string }) {
    await this.chat.sendDirect(body.from, body.to, body.text);
    return { ok: true };
  }

  @Get('history/:a/:b')
  async history(
    @Param('a') a: string,
    @Param('b') b: string,
    @Query('limit') limit = '100',
    @Query('before') before?: string,
  ) {
    const msgs = await this.chat.history(
      a,
      b,
      Number(limit),
      before ? Number(before) : undefined,
    );
    return { msgs };
  }
}
