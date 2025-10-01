import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { PresenceService } from '../presence/presence.service'; // << injeta presença

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private presence: PresenceService, // << aqui
  ) {}

  private sign(user: { id?: string; _id?: any; username: string }) {
    const sub = (user.id || user._id)?.toString() ?? undefined;
    const payload = { sub, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUser(username: string, pass: string) {
    const user = await (this.usersService as any).userModel
      .findOne({ username: username.toLowerCase() })
      .select('+password');

    if (!user) return null;

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) return null;

    return user;
  }

  async validateAndLogin(username: string, pass: string) {
    const user = await this.validateUser(username, pass);
    if (!user) throw new UnauthorizedException('Invalid credentials');


    return this.sign({ _id: user._id, username: user.username });
  }

  async logout(userId: string) {
    await this.presence.publishOffline(userId);
    return { ok: true };
  }

  async register(dto: RegisterDto) {
    const [byUser, byEmail] = await Promise.all([
      this.usersService.findByUsername(dto.username),
      this.usersService.findByEmail(dto.email),
    ]);

    if (byUser) throw new ConflictException('Username is already taken');
    if (byEmail) throw new ConflictException('E-mail is already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const created = await (this.usersService as any).userModel.create({
      ...dto,
      username: dto.username.toLowerCase(),
      email: dto.email.toLowerCase(),
      password: hashedPassword,
    });

    return this.sign({ _id: created._id, username: created.username });
  }
}
