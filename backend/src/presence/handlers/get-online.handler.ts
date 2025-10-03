import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { PresenceService } from '../presence.service';

export interface GetOnlineCommand {}
export interface GetOnlineResult { users: any[] }

@Injectable()
export class GetOnlineHandler
  implements ICommandHandler<GetOnlineCommand, GetOnlineResult>
{
  constructor(private readonly presence: PresenceService) {}

  async execute(_: GetOnlineCommand): Promise<GetOnlineResult> {
    return { users: this.presence.listOnline() };
  }
}
