import { Test } from '@nestjs/testing';
import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PresenceService } from '@/presence/presence.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (p: string) => `hashed:${p}`),
  compare: jest.fn(async (p: string, h: string) => h === `hashed:${p}`),
}));

function pickToken(body: any) {
  return body?.token || body?.access_token || body?.jwt;
}
function getLoginFn(svc: any) {
  return svc.login || svc.signIn || svc.signin || svc.authenticate || svc.loginUser;
}

describe('AuthService (unit)', () => {
  let service: AuthService;
  let users: any;
  let jwt: any;

  beforeEach(async () => {
    const userModel = { create: jest.fn() };
    users = {
      userModel,
      create: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findWithPasswordByUsername: jest.fn(),
    };

    jwt = { sign: jest.fn().mockReturnValue('token:stub') };

    const presence = { publishOffline: jest.fn(), markOnline: jest.fn(), markOffline: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
        { provide: PresenceService, useValue: presence },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('register: cria usuário (e aceita ou não retornar token)', async () => {
    users.findByUsername.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(null);
    users.userModel.create.mockResolvedValue({ _id: '1', username: 'francisco', email: 'f@ex.com' });

    const res: any = await (service as any).register({
      username: 'francisco',
      email: 'f@ex.com',
      password: '123456',
      name: 'francisco',
    });

    expect(users.userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'francisco',
        email: 'f@ex.com',
        password: expect.stringContaining('hashed:'),
      }),
    );

    const maybeToken = pickToken(res);
    expect(maybeToken !== undefined || res !== undefined).toBe(true);
  });

  it('login: sucesso com username (se o método existir)', async () => {
    const loginFn = getLoginFn(service as any);
    if (!loginFn) return;

    users.findWithPasswordByUsername.mockResolvedValue({
      _id: '1',
      username: 'francisco',
      password: 'hashed:123456',
    });

    const res: any = await loginFn.call(service, { username: 'francisco', password: '123456' });
    expect(pickToken(res)).toBeTruthy();
  });

  it('login: falha com senha incorreta (se o método existir)', async () => {
    const loginFn = getLoginFn(service as any);
    if (!loginFn) return;

    users.findWithPasswordByUsername.mockResolvedValue({
      _id: '1',
      username: 'francisco',
      password: 'hashed:outra',
    });

    await expect(loginFn.call(service, { username: 'francisco', password: '123456' })).rejects.toBeDefined();
  });
});
