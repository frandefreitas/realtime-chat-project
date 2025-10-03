import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { UsersService } from '../users.service';

export interface ListUsersCommand {}
export interface ListUsersResult { users: any[] }

@Injectable()
export class ListUsersHandler
  implements ICommandHandler<ListUsersCommand, ListUsersResult>
{
  constructor(private readonly users: UsersService) {}

  async execute(_: ListUsersCommand): Promise<ListUsersResult> {
    const users = await this.users.findAllUsernames();
    return { users };
  }
}
