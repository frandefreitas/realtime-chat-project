import { Injectable } from '@nestjs/common'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'
import { PublishOfflineHandler } from '@/presence/handlers/publish-offline.handler'

export interface LogoutCommand {
  userId: string
}

export interface LogoutResult {
  ok: true
}

@Injectable()
export class LogoutHandler implements ICommandHandler<LogoutCommand, LogoutResult> {
  constructor(private readonly publishOfflineHandler: PublishOfflineHandler) {}

  async execute({ userId }: LogoutCommand): Promise<LogoutResult> {
    await this.publishOfflineHandler.execute({ userId })
    return { ok: true }
  }
}
