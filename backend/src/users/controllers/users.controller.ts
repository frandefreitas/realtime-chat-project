import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetUserByIdHandler } from '../handlers/get-user-by-id.handler';
import { ListUsersHandler } from '../handlers/list-users.handler';
import { CreateUserHandler } from '../handlers/create-user.handler';
import { FindUsersHandler } from '../handlers/find-users.handler';

@Controller('users')
export class UsersController {
  constructor(
    private readonly getById: GetUserByIdHandler,
    private readonly listUsers: ListUsersHandler,
    private readonly createUser: CreateUserHandler,
    private readonly findUsers: FindUsersHandler,
  ) { }

  @Get(':id')
  getByIdRoute(@Param('id') id: string) {
    return this.getById.execute({ id });
  }

  @Get()
  listAll() {
    return this.listUsers.execute({});
  }

  @Get('find')
  find(@Query('q') q = '', @Query('limit') limit = '50') {
    return this.findUsers.execute({ q });
  }


  @Post()
  create(@Body() body: any) {
    return this.createUser.execute(body);
  }
}
