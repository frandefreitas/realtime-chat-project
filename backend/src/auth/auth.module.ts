import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '@/users/schemas/user.schema'
import { PresenceModule } from '@/presence/presence.module'
import { AuthController } from './controllers/auth.controller'
import { LoginHandler } from './handlers/login.handler'
import { RegisterHandler } from './handlers/register.handler'
import { LogoutHandler } from './handlers/logout.handler'
import { JwtStrategy } from './jwt.strategy'
import { LocalStrategy } from './local.strategy'

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'dev_fallback_secret_do_not_use_in_prod',
        signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
      }),
    }),
    PresenceModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    RegisterHandler,
    LogoutHandler,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [LoginHandler, RegisterHandler, LogoutHandler],
})
export class AuthModule {}
