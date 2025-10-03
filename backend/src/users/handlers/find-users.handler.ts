import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { UsersService } from '../users.service';

export interface FindUsersCommand { q?: string }
export interface FindUsersResult { users: any[] }

@Injectable()
export class FindUsersHandler
  implements ICommandHandler<FindUsersCommand, FindUsersResult>
{
  constructor(private readonly users: UsersService) {}

  async execute(cmd: FindUsersCommand): Promise<FindUsersResult> {
    const q = (cmd.q ?? '').toLowerCase();
    const DEFAULT_LIMIT = 50;

    const all = await this.users.findAllUsernames();

    const users = (Array.isArray(all) ? all : [])
      .filter((u: any) => {
        if (!q) return true;
        const username = String(u?.username ?? '').toLowerCase();
        const name = String(u?.name ?? '').toLowerCase();
        const email = String(u?.email ?? '').toLowerCase();
        return username.includes(q) || name.includes(q) || email.includes(q);
      })
      .slice(0, DEFAULT_LIMIT);

    return { users };
  }
}
