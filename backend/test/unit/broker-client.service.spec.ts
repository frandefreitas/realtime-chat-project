import { BrokerClientService } from '@/broker/broker-client.service';
import type { NatsConnection } from '@nats-io/nats-core';

describe('BrokerClientService (unit)', () => {
  let service: BrokerClientService;
  let conn: jest.Mocked<NatsConnection>;

  beforeEach(() => {
    conn = {
      publish: jest.fn(),
      request: jest.fn(),
      subscribe: jest.fn(),
      getServer: jest.fn().mockReturnValue('nats://localhost:4222'),
      status: (async function* () {}) as any,
      drain: jest.fn(),
      close: jest.fn(),
      closed: jest.fn(async () => undefined),
    } as any;

    service = new BrokerClientService(conn as unknown as NatsConnection);
  });

  it('publish deve serializar payload em JSON e chamar connection.publish', () => {
    service.publish('topic.test', { hello: 'world' });
    expect(conn.publish).toHaveBeenCalledWith('topic.test', JSON.stringify({ hello: 'world' }), undefined);
  });

  it('request deve retornar json do reply', async () => {
    (conn.request as jest.Mock).mockResolvedValue({
      json: () => ({ ok: true, value: 42 }),
    });
    const res = await service.request('topic.req', { a: 1 });
    expect(conn.request).toHaveBeenCalled();
    expect(res).toEqual({ ok: true, value: 42 });
  });

  it('subscribe deve repassar opções (omitindo onTimeout internamente)', () => {
    (conn.subscribe as jest.Mock).mockReturnValue({
      [Symbol.asyncIterator]: async function* () {},
      unsubscribe: jest.fn(),
    } as any);
    const handler = jest.fn();
    const sub = service.subscribe('presence.heartbeat.*', handler, { queue: 'q1' });
    expect(conn.subscribe).toHaveBeenCalledWith('presence.heartbeat.*', expect.objectContaining({ queue: 'q1' }));
    expect(sub).toBeTruthy();
  });
});
