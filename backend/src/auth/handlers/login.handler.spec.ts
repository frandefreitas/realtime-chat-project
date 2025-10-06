import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { LoginHandler } from './login.handler';
import { User } from '@/users/schemas/user.schema';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let userModel: any;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed-password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-token'),
          },
        },
      ],
    }).compile();

    handler = module.get<LoginHandler>(LoginHandler);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should login successfully with valid credentials (email)', async () => {
    const password = 'plain-pass';
    const command = { usernameOrEmail: 'test@example.com', password };

    jest.spyOn(userModel, 'findOne').mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({
        ...mockUser,
        password: await bcrypt.hash(password, 10),
      }),
    });

    const token = await handler.execute(command);

    expect(token).toEqual({ access_token: 'mocked-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user123',
      username: 'testuser',
    });
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    jest.spyOn(userModel, 'findOne').mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(null),
    });

    await expect(
      handler.execute({ usernameOrEmail: 'notfound@example.com', password: 'any' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is wrong', async () => {
    jest.spyOn(userModel, 'findOne').mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce({
        ...mockUser,
        password: await bcrypt.hash('correct-pass', 10),
      }),
    });

    await expect(
      handler.execute({ usernameOrEmail: 'test@example.com', password: 'wrong-pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
