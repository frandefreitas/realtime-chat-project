import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { PresenceModule } from 'src/presence/presence.module';
import { JwtStrategy } from './jwt.strategy';
import { LoginHandler } from './handlers/login.handler';
import { RegisterHandler } from './handlers/register.handler';
import { LogoutHandler } from './handlers/logout.handler';

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET') || 'dev_secret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
    PresenceModule,
  ],
  providers: [AuthService, JwtStrategy, LoginHandler, RegisterHandler, LogoutHandler],
  controllers: [AuthController],
})
export class AuthModule {}
