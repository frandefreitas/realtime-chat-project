import { Test, TestingModule } from '@nestjs/testing';
import { PublishOnlineHandler } from './publish-online.handler';
import { BrokerClientService } from '@/broker/broker-client.service';

describe('PublishOnlineHandler', () => {
  let handler: PublishOnlineHandler;
  let broker: BrokerClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishOnlineHandler,
        {
          provide: BrokerClientService,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<PublishOnlineHandler>(PublishOnlineHandler);
    broker = module.get<BrokerClientService>(BrokerClientService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should publish heartbeat event and return ok', async () => {
    const userId = 'abc123';
    const now = Date.now();
    jest.spyOn(global.Date, 'now').mockReturnValueOnce(now);

    const result = await handler.execute({ userId });

    expect(result).toEqual({ ok: true });
    expect(broker.publish).toHaveBeenCalledWith(`presence.heartbeat.${userId}`, { t: now });
  });
});
