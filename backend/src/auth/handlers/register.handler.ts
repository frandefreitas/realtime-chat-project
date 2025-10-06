import { Injectable, ConflictException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { User, UserDocument } from '@/users/schemas/user.schema'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'
import { RegisterDto } from '../dto/register.dto'

export interface RegisterCommand extends RegisterDto {}
export interface RegisterResult { access_token: string }

@Injectable()
export class RegisterHandler implements ICommandHandler<RegisterCommand, RegisterResult> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterCommand): Promise<RegisterResult> {
    const username = dto.username.toLowerCase()
    const email = dto.email.toLowerCase()

    const [byUser, byEmail] = await Promise.all([
      this.userModel.findOne({ username }).lean(),
      this.userModel.findOne({ email }).lean(),
    ])

    if (byUser) throw new ConflictException('Username is already taken')
    if (byEmail) throw new ConflictException('E-mail is already in use')

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const created = await this.userModel.create({
      ...dto,
      username,
      email,
      password: hashedPassword,
    })

    const payload = { sub: String(created._id), username: created.username }
    return { access_token: this.jwtService.sign(payload) }
  }
}
