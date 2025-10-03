import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './controllers/chat.controller';
import { Message, MessageSchema } from './schemas/message.schema';
import { BrokerModule } from '@/broker/broker.module';
import { SendDirectHandler } from './handlers/send-direct.handler';
import { GetHistoryHandler } from './handlers/get-history.handler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    BrokerModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, SendDirectHandler, GetHistoryHandler],
  exports: [ChatService],
})
export class ChatModule {}
