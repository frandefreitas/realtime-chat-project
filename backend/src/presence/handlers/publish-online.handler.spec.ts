import { Test, TestingModule } from '@nestjs/testing';
import { PublishOnlineHandler, PublishOnlineCommand } from './publish-online.handler';
import { BrokerClientService } from '@/broker/broker-client.service';

describe('PublishOnlineHandler', () => {
  let handler: PublishOnlineHandler;
  let broker: { publish: jest.Mock };

  const FIXED_NOW = 1_726_000_000_000;

  beforeAll(async () => {

    jest.spyOn(Date, 'now').mockImplementation(() => FIXED_NOW);

    broker = { publish: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishOnlineHandler,
        { provide: BrokerClientService, useValue: broker },
      ],
    }).compile();

    handler = module.get(PublishOnlineHandler);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('publica heartbeat no broker e retorna ok', async () => {
    const cmd: PublishOnlineCommand = { userId: 'user-123' };

    const res = await handler.execute(cmd);

    expect(broker.publish).toHaveBeenCalledTimes(1);
    expect(broker.publish).toHaveBeenCalledWith(
      'presence.heartbeat.user-123',
      { t: FIXED_NOW },
    );
    expect(res).toEqual({ ok: true });
  });

  it('usa o userId do comando para montar o subject', async () => {
    const cmd: PublishOnlineCommand = { userId: 'abc' };
    await handler.execute(cmd);

    expect(broker.publish).toHaveBeenLastCalledWith(
      'presence.heartbeat.abc',
      { t: FIXED_NOW },
    );
  });
});
