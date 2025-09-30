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
// Se já tiver seu guard JWT, descomente:
import { JwtAuthGuard } from '../auth/jwt.guard';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const AVATAR_DIR = './uploads/avatars';
ensureDir(AVATAR_DIR);

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
    // Ajuste conforme seu payload (req.user.sub ou req.user._id)
    const userId: string | undefined =
      req?.user?.sub || req?.user?._id?.toString();
    if (!userId) throw new BadRequestException('Usuário não identificado');
    await this.authService.logout(userId);
    return { ok: true };
  }

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
        filename: (_req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        // aceita apenas imagens
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Arquivo deve ser uma imagem'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const registerDto: RegisterDto & { avatar?: string } = { ...dto };
    if (avatar) {
      registerDto.avatar = `/uploads/avatars/${avatar.filename}`;
    }
    return this.authService.register(registerDto);
  }
}
