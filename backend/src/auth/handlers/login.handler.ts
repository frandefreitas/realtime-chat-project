import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { User, UserDocument } from '@/users/schemas/user.schema'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'

export interface LoginCommand {
  usernameOrEmail: string
  password: string
}

export interface LoginResult {
  access_token: string
}

@Injectable()
export class LoginHandler implements ICommandHandler<LoginCommand, LoginResult> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) { }

  async validate(identifier: string, password: string) {
    const q = (identifier ?? '').toString().trim().toLowerCase()
    if (!q) return null
    const user = await this.userModel
      .findOne(q.includes('@') ? { email: q } : { username: q })
      .select('+password')
    if (!user) return null
    const ok = await bcrypt.compare(password ?? '', user.password ?? '')
    return ok ? user : null
  }

  async execute({ usernameOrEmail, password }: { usernameOrEmail: string; password: string }) {
    const user = await this.validate(usernameOrEmail, password)
    if (!user) throw new UnauthorizedException('invalid credentials')
    const payload = { sub: String(user._id), username: user.username }
    return { access_token: this.jwtService.sign(payload) }
  }

}
