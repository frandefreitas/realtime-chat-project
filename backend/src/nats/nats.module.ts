import { Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NatsService } from './nats.service';
import { NatsClientService } from './nats-client.service';

@Global()
@Module({
  providers: [NatsService, NatsClientService],
  exports: [NatsService, NatsClientService],
})
export class NatsModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly nats: NatsService) {}
  async onModuleInit() { await this.nats.connect(); }
  async onModuleDestroy() { await this.nats.close(); }
}
