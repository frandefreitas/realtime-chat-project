import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { UsersService } from '../users.service';
import * as bcrypt from 'bcrypt';

export interface CreateUserCommand {
  name: string;
  username: string;
  email: string;
  password: string;
}
export interface CreateUserResponse { id: string; username: string; email: string; }

@Injectable()
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, CreateUserResponse> {
  constructor(private readonly users: UsersService) {}

  async execute(cmd: CreateUserCommand): Promise<CreateUserResponse> {
    const password = await bcrypt.hash(cmd.password, 10);
    const u = await (this.users as any).userModel.create({
      name: cmd.name,
      username: cmd.username.toLowerCase(),
      email: cmd.email.toLowerCase(),
      password,
    });
    return { id: String(u._id), username: u.username, email: u.email };
  }
}
