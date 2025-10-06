import { Test, TestingModule } from '@nestjs/testing';
import { LogoutHandler } from './logout.handler';
import { PublishOfflineHandler } from '@/presence/handlers/publish-offline.handler';

describe('LogoutHandler', () => {
  let handler: LogoutHandler;
  let publishOfflineHandler: PublishOfflineHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutHandler,
        {
          provide: PublishOfflineHandler,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<LogoutHandler>(LogoutHandler);
    publishOfflineHandler = module.get<PublishOfflineHandler>(PublishOfflineHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should publish user as offline and return ok', async () => {
    const userId = 'user123';
    const result = await handler.execute({ userId });

    expect(result).toEqual({ ok: true });
    expect(publishOfflineHandler.execute).toHaveBeenCalledWith({ userId });
  });
});
