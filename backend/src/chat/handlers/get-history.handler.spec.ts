import { Test, TestingModule } from '@nestjs/testing';
import { GetHistoryHandler } from './get-history.handler';
import { ChatService } from '../chat.service';

describe('GetHistoryHandler', () => {
  let handler: GetHistoryHandler;
  const mockChat = { history: jest.fn(async () => [{text:'hi'}]) };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHistoryHandler,
        { provide: ChatService, useValue: mockChat },
      ],
    }).compile();

    handler = module.get(GetHistoryHandler);
  });

  it('returns msgs', async () => {
    const res = await handler.execute({ a:'a', b:'b', limit: 10 });
    expect(mockChat.history).toHaveBeenCalled();
    expect(res.msgs).toHaveLength(1);
  });
});
