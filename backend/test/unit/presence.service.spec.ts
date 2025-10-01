import { Test } from '@nestjs/testing';
import { PresenceService } from '@/presence/presence.service';
import { BrokerClientService } from '@/broker/broker-client.service';

describe('PresenceService (unit)', () => {
  let service: PresenceService;
  let broker: { subscribe: jest.Mock; publish: jest.Mock };

  beforeEach(async () => {
    broker = {
      subscribe: jest.fn().mockReturnValue({
        unsubscribe: jest.fn(),
        [Symbol.asyncIterator]: async function* () {},
      }),
      publish: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        PresenceService,
        { provide: BrokerClientService, useValue: broker },
      ],
    }).compile();

    service = moduleRef.get(PresenceService);
    if (typeof (service as any).onModuleInit === 'function') {
      await (service as any).onModuleInit();
    }
  });

  afterEach(async () => {
    if (typeof (service as any).onModuleDestroy === 'function') {
      await (service as any).onModuleDestroy();
    }
  });

  it('marca online ao heartbeat', async () => {
    const sub = broker.subscribe.mock.calls.find((c) => String(c[0]).includes('presence.heartbeat'));
    expect(sub).toBeTruthy();
    const handler = sub![1];
    await handler('presence.heartbeat.luana', { t: Date.now() }, { subject: 'presence.heartbeat.luana' });

    const online = service.listOnline();
    const usernames = online.map((o: any) => (typeof o === 'string' ? o : o.username));
    expect(usernames).toContain('luana');
  });

  it('publica offline', async () => {
    await service.publishOffline('luiza');
    expect(broker.publish).toHaveBeenCalledWith('presence.offline.luiza', expect.any(Object));
  });
});
