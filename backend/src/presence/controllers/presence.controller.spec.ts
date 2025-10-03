import { Test, TestingModule } from '@nestjs/testing';
import { PresenceController } from './presence.controller';
import { GetOnlineHandler } from '../handlers/get-online.handler';
import { PublishOnlineHandler } from '../handlers/publish-online.handler';

describe('PresenceController', () => {
  let controller: PresenceController;
  let getOnlineHandler: jest.Mocked<GetOnlineHandler>;
  let publishOnlineHandler: jest.Mocked<PublishOnlineHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresenceController],
      providers: [
        { provide: GetOnlineHandler, useValue: { execute: jest.fn() } },
        { provide: PublishOnlineHandler, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<PresenceController>(PresenceController);
    getOnlineHandler = module.get(GetOnlineHandler);
    publishOnlineHandler = module.get(PublishOnlineHandler);
  });

  it('getOnline chama handler com {}', async () => {
    getOnlineHandler.execute.mockResolvedValue(['u1', 'u2']);
    const res = await controller.getOnline();
    expect(getOnlineHandler.execute).toHaveBeenCalledWith({});
    expect(res).toEqual(['u1', 'u2']);
  });

  it('publish chama handler com userId string', async () => {
    publishOnlineHandler.execute.mockResolvedValue({ ok: true });
    const res = await controller.publish({ userId: 123 });
    expect(publishOnlineHandler.execute).toHaveBeenCalledWith({ userId: '123' });
    expect(res).toEqual({ ok: true });
  });

  it('publish trata body indefinido', async () => {
    publishOnlineHandler.execute.mockResolvedValue({ ok: true });
    const res = await controller.publish(undefined);
    expect(publishOnlineHandler.execute).toHaveBeenCalledWith({ userId: '' });
    expect(res).toEqual({ ok: true });
  });
});
