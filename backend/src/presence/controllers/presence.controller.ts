import { Body, Controller, Get, Post, BadRequestException } from '@nestjs/common'
import { GetOnlineHandler } from '../handlers/get-online.handler'
import { PublishOnlineHandler } from '../handlers/publish-online.handler'
import { PublishOfflineHandler } from '../handlers/publish-offline.handler'

@Controller('presence')
export class PresenceController {
  constructor(
    private readonly getOnlineHandler: GetOnlineHandler,
    private readonly publishOnlineHandler: PublishOnlineHandler,
    private readonly publishOfflineHandler: PublishOfflineHandler,
  ) {}

  @Get('online')
  getOnline() {
    return this.getOnlineHandler.execute({})
  }

  @Post('publish')
  publish(@Body() body: any) {
    const userId = String(body?.userId ?? '').trim()
    if (!userId) throw new BadRequestException('userId obrigatório')
    return this.publishOnlineHandler.execute({ userId })
  }

  @Post('offline')
  offline(@Body() body: any) {
    const userId = String(body?.userId ?? '').trim()
    if (!userId) throw new BadRequestException('userId obrigatório')
    return this.publishOfflineHandler.execute({ userId })
  }
}
