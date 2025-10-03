import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { GetUserByIdHandler } from './handlers/get-user-by-id.handler';
import { ListUsersHandler } from './handlers/list-users.handler';
import { FindUsersHandler } from './handlers/find-users.handler';
import { CreateUserHandler } from './handlers/create-user.handler';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [
    UsersService,
    GetUserByIdHandler,
    ListUsersHandler,
    CreateUserHandler,
    FindUsersHandler,
  ],
  exports: [UsersService],
})
export class UsersModule {}
