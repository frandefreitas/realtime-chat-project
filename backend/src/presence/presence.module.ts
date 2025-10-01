import { Module } from '@nestjs/common';
import { BrokerModule } from '@/broker/broker.module';
import { PresenceService } from './presence.service';
import { PresenceController } from './presence.controller';

@Module({
  imports: [BrokerModule],
  providers: [PresenceService],
  controllers: [PresenceController],
  exports: [PresenceService],
})
export class PresenceModule {}
