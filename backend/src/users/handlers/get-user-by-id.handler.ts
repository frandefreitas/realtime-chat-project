import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'
import { User, UserDocument } from '../schemas/user.schema'

export interface GetUserByIdCommand { id: string }
export interface GetUserByIdResult { user: any }

@Injectable()
export class GetUserByIdHandler implements ICommandHandler<GetUserByIdCommand, GetUserByIdResult> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async execute(cmd: GetUserByIdCommand): Promise<GetUserByIdResult> {
    const id = String(cmd.id || '')
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('User not found')
    const user = await this.userModel.findById(id).lean()
    if (!user) throw new NotFoundException('User not found')
    delete (user as any).password
    return { user }
  }
}
