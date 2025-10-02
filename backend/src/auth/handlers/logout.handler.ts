import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { AuthService } from '../auth.service';

export interface LogoutCommand { userId: string; }
export interface LogoutResult { ok: true; }

@Injectable()
export class LogoutHandler implements ICommandHandler<LogoutCommand, LogoutResult> {
  constructor(private readonly auth: AuthService) {}

  async execute(cmd: LogoutCommand): Promise<LogoutResult> {
    await this.auth.logout(cmd.userId);
    return { ok: true };
  }
}
