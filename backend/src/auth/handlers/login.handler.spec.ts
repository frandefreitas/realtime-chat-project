import { Test, TestingModule } from '@nestjs/testing';
import { LoginHandler } from './login.handler';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/users.service';

jest.mock('bcrypt', () => ({ compare: jest.fn(async () => true) }));

describe('LoginHandler', () => {
  let handler: LoginHandler;

  const findOne = jest.fn(() => ({
    select: jest.fn().mockResolvedValue({
      _id: '1',
      username: 'francisco',
      password: '$2b$10$hash',
    }),
  }));

  const mockUsersService: Partial<UsersService> = {
    // @ts-ignore
    userModel: { findOne },
  };

  const mockJwt: Partial<JwtService> = {
    signAsync: jest.fn(async () => 'fake-token'),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginHandler,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    handler = module.get(LoginHandler);
  });

  it('logs in with username and returns token', async () => {
    const res = await handler.execute({ usernameOrEmail: 'francisco', password: 'x' });
    expect(res.token).toBe('fake-token');
  });
});
