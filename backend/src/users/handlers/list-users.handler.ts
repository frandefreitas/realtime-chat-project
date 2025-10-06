import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'
import { User, UserDocument } from '../schemas/user.schema'

export interface ListUsersCommand {}
export interface ListUsersResult { users: any[] }

@Injectable()
export class ListUsersHandler implements ICommandHandler<ListUsersCommand, ListUsersResult> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async execute(_: ListUsersCommand): Promise<ListUsersResult> {
    const users = await this.userModel.find({}, { username: 1, name: 1, email: 1 }).lean()
    return { users }
  }
}
