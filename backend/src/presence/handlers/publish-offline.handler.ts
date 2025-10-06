import { Injectable } from '@nestjs/common'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'
import { BrokerClientService } from '@/broker/broker-client.service'

export interface PublishOfflineCommand { userId: string }
export interface PublishOfflineResponse { ok: true }

@Injectable()
export class PublishOfflineHandler implements ICommandHandler<PublishOfflineCommand, PublishOfflineResponse> {
  constructor(private readonly broker: BrokerClientService) {}
  async execute(cmd: PublishOfflineCommand): Promise<PublishOfflineResponse> {
    this.broker.publish(`presence.offline.${cmd.userId}`, { t: Date.now() })
    return { ok: true }
  }
}
