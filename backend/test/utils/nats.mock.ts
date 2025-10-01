import { Msg, Subscription } from '@nats-io/nats-core';

export function createMockNatsConnection() {
  return {
    publish: jest.fn(),
    request: jest.fn(),
    subscribe: jest.fn((topic: string, _opts?: any): Subscription => {
      const sub: any = {
        subject: topic,
        closed: false,
        unsubscribe: jest.fn(),
        drain: jest.fn(),
        [Symbol.asyncIterator]: async function* () {},
      };
      return sub as Subscription;
    }),
    getServer: jest.fn(() => 'nats://localhost:4222'),
    status: jest.fn(async function* () {}),
    drain: jest.fn(),
    close: jest.fn(),
    closed: jest.fn(async () => undefined),
  };
}

export function createMockBrokerClientService() {
  return {
    publish: jest.fn(),
    request: jest.fn(),
    reply: jest.fn(),
    subscribe: jest.fn(),
    disconnect: jest.fn(),
    connection: createMockNatsConnection(),
  };
}
