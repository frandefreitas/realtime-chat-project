import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { BrokerClientService } from '@/broker/broker-client.service';

export interface PublishOnlineCommand { userId: string; }
export interface PublishOnlineResponse { ok: true; }

@Injectable()
export class PublishOnlineHandler implements ICommandHandler<PublishOnlineCommand, PublishOnlineResponse> {
  constructor(private readonly broker: BrokerClientService) {}

  async execute(cmd: PublishOnlineCommand): Promise<PublishOnlineResponse> {
    // Publica um heartbeat para marcar o usuário como online
    const subject = `presence.heartbeat.${cmd.userId}`;
    this.broker.publish(subject, { t: Date.now() });
    return { ok: true };
  }
}
