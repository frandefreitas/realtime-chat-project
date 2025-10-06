import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginHandler } from '../handlers/login.handler';
import { RegisterHandler } from '../handlers/register.handler';
import { LogoutHandler } from '../handlers/logout.handler';

describe('AuthController', () => {
  let controller: AuthController;
  let loginHandler: LoginHandler;
  let registerHandler: RegisterHandler;
  let logoutHandler: LogoutHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginHandler,
          useValue: { execute: jest.fn() },
        },
        {
          provide: RegisterHandler,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LogoutHandler,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginHandler = module.get<LoginHandler>(LoginHandler);
    registerHandler = module.get<RegisterHandler>(RegisterHandler);
    logoutHandler = module.get<LogoutHandler>(LogoutHandler);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call loginHandler with correct payload', async () => {
    const body = { username: 'test@example.com', password: '123456' };
    const result = { token: 'fake-jwt-token' };

    jest.spyOn(loginHandler, 'execute').mockResolvedValueOnce(result);

    const response = await controller.login(body);
    expect(response).toEqual(result);
    expect(loginHandler.execute).toHaveBeenCalledWith({
      usernameOrEmail: 'test@example.com',
      password: '123456',
    });
  });

  it('should call registerHandler with dto', async () => {
    const dto = { name: 'John', email: 'test@test.com', password: 'pass' };
    const result = { access_token: 'xyz' };

    jest.spyOn(registerHandler, 'execute').mockResolvedValueOnce(result);

    const response = await controller.register(dto);
    expect(response).toEqual(result);
    expect(registerHandler.execute).toHaveBeenCalledWith(dto);
  });

  it('should call logoutHandler with userId', async () => {
    const userId = 'user123';
    const result = { ok: true };

    jest.spyOn(logoutHandler, 'execute').mockResolvedValueOnce(result);

    const response = await controller.logout(userId);
    expect(response).toEqual(result);
    expect(logoutHandler.execute).toHaveBeenCalledWith({ userId });
  });
});
