import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { JwtAuthGuard } from '../auth/jwt.guard';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.validateAndLogin(dto.username, dto.password);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any) {
    const userId: string | undefined =
      req?.user?.sub || req?.user?._id?.toString();
    if (!userId) throw new BadRequestException('Usuário não identificado');
    await this.authService.logout(userId);
    return { ok: true };
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(
    @Body() dto: RegisterDto,
  ) {
    const registerDto: RegisterDto = { ...dto };
    return this.authService.register(registerDto);
  }
}
