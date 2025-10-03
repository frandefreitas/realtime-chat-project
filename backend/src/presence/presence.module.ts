// src/presence/presence.module.ts
import { Module } from '@nestjs/common';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { GetOnlineHandler } from './handlers/get-online.handler';
import { PublishOnlineHandler } from './handlers/publish-online.handler';
import { BrokerModule } from '@/broker/broker.module';

@Module({
  imports: [BrokerModule],
  controllers: [PresenceController],
  providers: [PresenceService, GetOnlineHandler, PublishOnlineHandler],
  exports: [PresenceService],
})
export class PresenceModule {}
