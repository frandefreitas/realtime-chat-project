import { Controller, Get } from '@nestjs/common';
import { PresenceService } from './presence.service';

@Controller('presence')
export class PresenceController {
  constructor(private readonly presence: PresenceService) {}

  @Get('online')
  getOnline() {
    return { users: this.presence.listOnline() };
  }
}
