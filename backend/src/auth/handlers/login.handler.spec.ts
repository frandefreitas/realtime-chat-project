import { Test, TestingModule } from '@nestjs/testing';
import { LoginHandler } from './login.handler';
import { AuthService } from '../auth.service';

describe('LoginHandler', () => {
  let handler: LoginHandler;
  const mockAuth = { login: jest.fn(async () => ({ token: 'fake', username: 'francisco', userId: '1' })) };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginHandler,
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compile();

    handler = module.get(LoginHandler);
  });

  it('delegates to AuthService.login', async () => {
    const res = await handler.execute({ usernameOrEmail: 'francisco', password: 'x' });
    expect(mockAuth.login).toHaveBeenCalledWith('francisco', 'x');
    expect(res.token).toBe('fake');
  });
});
