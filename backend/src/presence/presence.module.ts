import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BrokerModule } from '@/broker/broker.module'
import { PresenceController } from './controllers/presence.controller'
import { GetOnlineHandler } from './handlers/get-online.handler'
import { PublishOnlineHandler } from './handlers/publish-online.handler'
import { PublishOfflineHandler } from './handlers/publish-offline.handler'
import { User, UserSchema } from '@/users/schemas/user.schema'

@Module({
  imports: [
    BrokerModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PresenceController],
  providers: [GetOnlineHandler, PublishOnlineHandler, PublishOfflineHandler],
  exports: [GetOnlineHandler, PublishOnlineHandler, PublishOfflineHandler],
})
export class PresenceModule {}
