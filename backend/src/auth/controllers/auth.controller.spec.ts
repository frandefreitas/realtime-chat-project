import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginHandler } from '../handlers/login.handler';
import { RegisterHandler } from '../handlers/register.handler';
import { LogoutHandler } from '../handlers/logout.handler';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let loginHandler: jest.Mocked<LoginHandler>;
  let registerHandler: jest.Mocked<RegisterHandler>;
  let logoutHandler: jest.Mocked<LogoutHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginHandler, useValue: { execute: jest.fn() } },
        { provide: RegisterHandler, useValue: { execute: jest.fn() } },
        { provide: LogoutHandler, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginHandler = module.get(LoginHandler);
    registerHandler = module.get(RegisterHandler);
    logoutHandler = module.get(LogoutHandler);
  });

  it('deve chamar o loginHandler com o comando correto', async () => {
    loginHandler.execute.mockResolvedValue({ token: 'jwt-token', username: 'john', userId: '1' });
    const dto: LoginDto = { username: 'john', password: '12345678' } as any;
    const result = await controller.login(dto);
    expect(loginHandler.execute).toHaveBeenCalledWith({
      usernameOrEmail: 'john',
      password: '12345678',
    });
    expect(result).toEqual({ token: 'jwt-token', username: 'john', userId: '1' });
  });

  it('deve chamar o registerHandler com o comando correto', async () => {
    registerHandler.execute.mockResolvedValue({ id: '1', username: 'john' });
    const dto: RegisterDto = { username: 'john', email: 'john@test.com', password: '12345678' } as any;
    const result = await controller.register(dto);
    expect(registerHandler.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: '1', username: 'john' });
  });

  it('deve chamar o logoutHandler com o userId extraído do req', async () => {
    logoutHandler.execute.mockResolvedValue({ success: true });
    const req = { user: { sub: '12345678' } };
    const result = await controller.logout(req);
    expect(logoutHandler.execute).toHaveBeenCalledWith({ userId: '12345678' });
    expect(result).toEqual({ success: true });
  });
});
