import { Test } from '@nestjs/testing';
import { ChatService } from '@/chat/chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { BrokerClientService } from '@/broker/broker-client.service';

describe('ChatService (unit)', () => {
  let service: ChatService;
  let model: any;
  let broker: BrokerClientService;

  beforeEach(async () => {
    model = { create: jest.fn().mockResolvedValue({ _id: '1', from: 'a', to: 'b', text: 'hi', ts: 123 }) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken('Message'), useValue: model },
        {
          provide: BrokerClientService,
          useValue: { publish: jest.fn(), request: jest.fn(), reply: jest.fn(), subscribe: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(ChatService);
    broker = moduleRef.get(BrokerClientService);
  });

  it('sendDirect deve salvar no Mongo e publicar no tópico correto', async () => {
    await service.sendDirect('a', 'b', 'hi');
    expect(model.create).toHaveBeenCalledWith(expect.objectContaining({ from: 'a', to: 'b', text: 'hi' }));
    expect((broker.publish as any)).toHaveBeenCalledWith('chat.direct.b.a', expect.objectContaining({ text: 'hi' }));
  });
});
