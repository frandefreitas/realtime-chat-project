import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'
import { User, UserDocument } from '../schemas/user.schema'
import * as bcrypt from 'bcrypt'

export interface CreateUserCommand {
  username: string
  email: string
  password: string
  name?: string
  [k: string]: any
}
export type CreateUserResult = any

@Injectable()
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, CreateUserResult> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async execute(cmd: CreateUserCommand): Promise<CreateUserResult> {
    const username = String(cmd.username || '').trim().toLowerCase()
    const email = String(cmd.email || '').trim().toLowerCase()
    const password = String(cmd.password || '').trim()
    const name = String(cmd.name || cmd.username || '').trim()

    if (!username || !email || !password) {
      throw new BadRequestException('username, email and password are required')
    }

    const exists = await this.userModel.findOne({ $or: [{ username }, { email }] }).lean()
    if (exists) {
      throw new BadRequestException('username or email already in use')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const doc = new this.userModel({ username, email, name, password: passwordHash })
    await doc.save()
    const obj = doc.toObject()
    delete (obj as any).password
    return obj
  }
}
