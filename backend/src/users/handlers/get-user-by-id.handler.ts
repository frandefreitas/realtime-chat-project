import { Injectable, NotFoundException } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { UsersService } from '../users.service';

export interface GetUserByIdCommand { id: string }
export interface GetUserByIdResult { user: any }

@Injectable()
export class GetUserByIdHandler
  implements ICommandHandler<GetUserByIdCommand, GetUserByIdResult>
{
  constructor(private readonly users: UsersService) {}

  async execute(cmd: GetUserByIdCommand): Promise<GetUserByIdResult> {
    const user = await this.users.findById(cmd.id);
    if (!user) throw new NotFoundException('User not found');
    return { user };
  }
}
