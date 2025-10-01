import {
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  async listAll() {
    const users = await this.usersService.findAllUsernames();
    return { users }; 
  }

}
