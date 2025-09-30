import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import { join } from 'path';

type CreateUserInput = {
  name: string;
  username: string;
  email: string;
  avatar?: string;
  password: string; // já com hash
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  findByUsername(username: string) {
    return this.userModel.findOne({ username: username.toLowerCase() }).lean();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).lean();
  }

  findAll() {
    return this.userModel.find().lean();
  }

  async create(input: CreateUserInput) {
    const doc = new this.userModel({
      ...input,
      username: input.username.toLowerCase(),
      email: input.email.toLowerCase(),
      avatarUrl: input.avatar,
    });
    await doc.save();
    const obj = doc.toObject();
    delete (obj as Partial<typeof obj> & { password?: string }).password;
    return obj;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    delete (user as any).password;
    return user;
  }

  async findWithPasswordByUsername(username: string) {
    return this.userModel
      .findOne({ username: username.toLowerCase() })
      .select('+password')
      .lean();
  }

  async findAllUsernames(): Promise<string[]> {
    const docs = await this.userModel.find({}, { username: 1, _id: 0 }).lean();
    return docs.map(d => d.username).filter(Boolean);
  }

  async updateAvatar(userId: string, avatar: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      try {
        const localPath = join(process.cwd(), user.avatar);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (err) {
        console.warn('Não foi possível remover avatar antigo:', err?.message);
      }
    }
  
    user.avatar = avatar;
    await user.save();
  
    const obj = user.toObject();
    delete (obj as Partial<typeof obj> & { password?: string }).password;
    return obj;
  }
}
