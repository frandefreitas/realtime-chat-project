import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'
import { User, UserDocument } from '../schemas/user.schema'

export interface FindUsersCommand { q?: string }
export interface FindUsersResult { users: any[] }

@Injectable()
export class FindUsersHandler implements ICommandHandler<FindUsersCommand, FindUsersResult> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async execute(cmd: FindUsersCommand): Promise<FindUsersResult> {
    const q = String(cmd.q || '').trim().toLowerCase()
    if (!q) {
      const all = await this.userModel.find({}, { username: 1 }).lean()
      return { users: all.map(u => u.username).filter(Boolean) }
    }
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const docs = await this.userModel.find({ $or: [{ username: rx }, { name: rx }, { email: rx }] }, { username: 1 }).lean()
    return { users: docs.map(d => d.username).filter(Boolean) }
  }
}
