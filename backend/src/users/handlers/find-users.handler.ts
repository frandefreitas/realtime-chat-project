import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { UsersService } from '../users.service';

export interface FindUsersCommand { q?: string }
export interface FindUsersResponse { users: Array<{ id: string; username: string }>; }

@Injectable()
export class FindUsersHandler implements ICommandHandler<FindUsersCommand, FindUsersResponse> {
  constructor(private readonly users: UsersService) {}

  async execute(cmd: FindUsersCommand): Promise<FindUsersResponse> {
    const usernames = await this.users.findAllUsernames();
    const filtered = cmd.q
      ? usernames.filter(u => u.toLowerCase().includes(cmd.q!.toLowerCase()))
      : usernames;
    return { users: filtered.map(u => ({ id: u, username: u })) };
  }
}
