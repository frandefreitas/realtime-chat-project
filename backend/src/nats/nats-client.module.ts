import { Global, Module } from '@nestjs/common';
import { NatsClientService } from './nats-client.service';
import { UsersService } from '@/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/users/schemas/user.schema';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [NatsClientService, UsersService],
  exports: [NatsClientService],
})
export class NatsClientModule {}
