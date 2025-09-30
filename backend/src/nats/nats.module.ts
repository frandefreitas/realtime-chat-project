import { Module } from '@nestjs/common';
import { UsersNatsService } from './users-nats.service';
import { IntercomNatsService } from './intercom-nats.service';
import { AccessNatsService } from './access-nats.service';
import { PresenceModule } from '../presence/presence.module';
import { NatsClientModule } from './nats-client.module'; // 👈 aqui
import { NatsProxyController } from './nats.proxy.controller';
import { UsersService } from '@/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/users/schemas/user.schema';

@Module({
  imports: [PresenceModule, NatsClientModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [NatsProxyController],
  providers: [UsersNatsService, IntercomNatsService, AccessNatsService, UsersService],
})
export class NatsModule {}
