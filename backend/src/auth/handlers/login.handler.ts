import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

export interface LoginCommand { usernameOrEmail: string; password: string; }
export interface LoginResult { token: string; username: string; userId: string; }

@Injectable()
export class LoginHandler implements ICommandHandler<LoginCommand, LoginResult> {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async execute(cmd: LoginCommand): Promise<LoginResult> {
    const q = cmd.usernameOrEmail.trim().toLowerCase();
    const user = await (this.users as any).userModel
      .findOne(q.includes('@') ? { email: q } : { username: q })
      .select('+password');

    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await bcrypt.compare(cmd.password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const payload = { sub: String(user._id), username: user.username };
    const token = await this.jwt.signAsync(payload);
    return { token, username: user.username, userId: String(user._id) };
  }
}
