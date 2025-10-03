import { Injectable, BadRequestException } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { UsersService } from '../users.service';

export interface CreateUserCommand {
  username: string;
  email: string;
  password: string;
  name?: string;
  [k: string]: any;
}
export type CreateUserResult = any;

@Injectable()
export class CreateUserHandler
  implements ICommandHandler<CreateUserCommand, CreateUserResult>
{
  constructor(private readonly users: UsersService) {}

  async execute(cmd: CreateUserCommand): Promise<CreateUserResult> {
    if (!cmd.username || !cmd.email || !cmd.password) {
      throw new BadRequestException('username, email and password are required');
    }

    const payload = {
      ...cmd,
      name: (cmd.name ?? cmd.username).trim(),
      username: String(cmd.username).trim(),
      email: String(cmd.email).toLowerCase().trim(),
    };

    const created = await this.users.create(payload as any); 
    return created;
  }
}
