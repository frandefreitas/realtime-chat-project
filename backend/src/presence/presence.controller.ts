import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetOnlineHandler, GetOnlineCommand } from './handlers/get-online.handler';
import { PublishOnlineHandler } from './handlers/publish-online.handler';

@Controller('presence')
export class PresenceController {
  constructor(
    private readonly getOnlineHandler: GetOnlineHandler,
    private readonly publishOnlineHandler: PublishOnlineHandler,
  ) {}

  @Get('online')
  async getOnline() {
    const cmd: GetOnlineCommand = {};
    return this.getOnlineHandler.execute(cmd);
  }

  @Post('publish')
  async publish(@Body() body: any) {
    return this.publishOnlineHandler.execute({ userId: String(body?.userId ?? '') });
  }
}
