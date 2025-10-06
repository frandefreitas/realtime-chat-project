import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SendDirectHandler } from './send-direct.handler';
import { BrokerClientService } from '@/broker/broker-client.service';
import { Message } from '../schemas/message.schema';

describe('SendDirectHandler', () => {
  let handler: SendDirectHandler;
  let broker: BrokerClientService;
  let msgModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendDirectHandler,
        {
          provide: BrokerClientService,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: getModelToken(Message.name),
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<SendDirectHandler>(SendDirectHandler);
    broker = module.get<BrokerClientService>(BrokerClientService);
    msgModel = module.get(getModelToken(Message.name));
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create a message and publish it', async () => {
    const cmd = { from: 'user1', to: 'user2', text: 'hello' };
    const now = Date.now();

    jest.spyOn(global.Date, 'now').mockReturnValueOnce(now);
    msgModel.create.mockResolvedValueOnce(null);

    const result = await handler.execute(cmd);

    expect(result).toEqual({ ok: true });

    expect(msgModel.create).toHaveBeenCalledWith({
      from: 'user1',
      to: 'user2',
      text: 'hello',
      ts: now,
    });

    expect(broker.publish).toHaveBeenCalledWith(`chat.direct.user2.user1`, {
      from: 'user1',
      to: 'user2',
      text: 'hello',
      ts: now,
    });
  });
});
