import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { AuthService } from '../auth.service';
import { RegisterDto } from '../dto/register.dto';

export interface RegisterCommand extends RegisterDto {}
export interface RegisterResult { token: string; username?: string; userId?: string; }

@Injectable()
export class RegisterHandler implements ICommandHandler<RegisterCommand, RegisterResult> {
  constructor(private readonly auth: AuthService) {}

  async execute(cmd: RegisterCommand): Promise<RegisterResult> {
    return this.auth.register(cmd as RegisterDto) as any;
  }
}
