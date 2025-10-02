import { Test, TestingModule } from '@nestjs/testing';
import { SendDirectHandler } from './send-direct.handler';
import { ChatService } from '../chat.service';

describe('SendDirectHandler', () => {
  let handler: SendDirectHandler;
  const mockChat = { sendDirect: jest.fn(async () => {}) };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendDirectHandler,
        { provide: ChatService, useValue: mockChat },
      ],
    }).compile();

    handler = module.get(SendDirectHandler);
  });

  it('sends and returns ok', async () => {
    const res = await handler.execute({ from: 'a', to: 'b', text: 'hi' });
    expect(mockChat.sendDirect).toHaveBeenCalledWith('a','b','hi');
    expect(res).toEqual({ ok: true });
  });
});
