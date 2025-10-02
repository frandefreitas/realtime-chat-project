import { Test, TestingModule } from '@nestjs/testing';
import { RegisterHandler } from './register.handler';
import { AuthService } from '../auth.service';

describe('RegisterHandler', () => {
  let handler: RegisterHandler;
  const mockAuth = { register: jest.fn(async () => ({ token: 't', username: 'newuser', userId: '2' })) };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterHandler,
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compile();

    handler = module.get(RegisterHandler);
  });

  it('delegates to AuthService.register', async () => {
    const dto = { name: 'n', username: 'u', email: 'e@e.com', password: 'p' };
    const res = await handler.execute(dto);
    expect(mockAuth.register).toHaveBeenCalledWith(dto);
    expect(res.token).toBe('t');
  });
});
