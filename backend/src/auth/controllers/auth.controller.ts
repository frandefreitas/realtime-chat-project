import { Controller, Post, Body } from '@nestjs/common'
import { LoginHandler } from '../handlers/login.handler'
import { RegisterHandler } from '../handlers/register.handler'
import { LogoutHandler } from '../handlers/logout.handler'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginHandler: LoginHandler,
    private readonly registerHandler: RegisterHandler,
    private readonly logoutHandler: LogoutHandler,
  ) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.loginHandler.execute({
      usernameOrEmail: body.username,
      password: body.password,
    })
  }

  @Post('register')
  register(@Body() dto: any) {
    return this.registerHandler.execute(dto)
  }

  @Post('logout')
  logout(@Body('userId') userId: string) {
    return this.logoutHandler.execute({ userId })
  }
}
