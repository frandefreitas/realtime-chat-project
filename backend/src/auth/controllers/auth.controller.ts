import { Body, Controller, Post, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../jwt.guard';
import { LoginHandler, LoginCommand } from '../handlers/login.handler';
import { RegisterHandler, RegisterCommand } from '../handlers/register.handler';
import { LogoutHandler, LogoutCommand } from '../handlers/logout.handler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly registerHandler: RegisterHandler,
    private readonly logoutHandler: LogoutHandler,
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() dto: LoginDto) {
    const cmd: LoginCommand = { usernameOrEmail: dto.username, password: dto.password };
    return this.loginHandler.execute(cmd);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(@Body() dto: RegisterDto) {
    const cmd: RegisterCommand = { ...dto };
    return this.registerHandler.execute(cmd);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any) {
    const userId = String(req?.user?.sub || '');
    const cmd: LogoutCommand = { userId };
    return this.logoutHandler.execute(cmd);
  }
}
