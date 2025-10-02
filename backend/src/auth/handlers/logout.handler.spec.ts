import { Test, TestingModule } from '@nestjs/testing';
import { LogoutHandler } from './logout.handler';
import { AuthService } from '../auth.service';

describe('LogoutHandler', () => {
  let handler: LogoutHandler;
  const mockAuth = { logout: jest.fn(async () => {}) };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutHandler,
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compile();

    handler = module.get(LogoutHandler);
  });

  it('calls AuthService.logout and returns ok', async () => {
    const res = await handler.execute({ userId: 'abc' });
    expect(mockAuth.logout).toHaveBeenCalledWith('abc');
    expect(res).toEqual({ ok: true });
  });
});
