// src/chat/chat.controller.ts
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SendDirectHandler } from './handlers/send-direct.handler';
import { GetHistoryHandler } from './handlers/get-history.handler';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly sendDirect: SendDirectHandler,
    private readonly getHistory: GetHistoryHandler,
  ) {}

  @Post('send')
  send(@Body() body: { from: string; to: string; text: string }) {
    return this.sendDirect.execute(body);
  }

  @Get('history/:a/:b')
  history(
    @Param('a') a: string,
    @Param('b') b: string,
    @Query('limit') limit = '100',
    @Query('before') before?: string,
  ) {
    return this.getHistory.execute({
      a,
      b,
      limit: Number(limit),
      before: before ? Number(before) : undefined,
    });
  }
}
