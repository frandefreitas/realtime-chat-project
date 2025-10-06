import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './controllers/chat.controller';
import { Message, MessageSchema } from './schemas/message.schema';
import { BrokerModule } from '@/broker/broker.module';
import { SendDirectHandler } from './handlers/send-direct.handler';
import { GetHistoryHandler } from './handlers/get-history.handler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    BrokerModule],
  controllers: [ChatController],
  providers: [SendDirectHandler, GetHistoryHandler],
  
})
export class ChatModule {}
