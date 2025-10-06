import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GetHistoryHandler } from './get-history.handler';
import { Message } from '../schemas/message.schema';
import { Model } from 'mongoose';

describe('GetHistoryHandler', () => {
  let handler: GetHistoryHandler;
  let msgModel: Model<any>;

  const mockQueryChain = {
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHistoryHandler,
        {
          provide: getModelToken(Message.name),
          useValue: {
            find: jest.fn().mockReturnValue(mockQueryChain),
          },
        },
      ],
    }).compile();

    handler = module.get<GetHistoryHandler>(GetHistoryHandler);
    msgModel = module.get(getModelToken(Message.name));
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return message history with default limit', async () => {
    const cmd = { a: 'user1', b: 'user2' };
    const result = await handler.execute(cmd);
    expect(result).toEqual({ msgs: [] });

    expect(msgModel.find).toHaveBeenCalledWith({
      $or: [{ from: 'user1', to: 'user2' }, { from: 'user2', to: 'user1' }],
    });
    expect(mockQueryChain.sort).toHaveBeenCalledWith({ ts: 1 });
    expect(mockQueryChain.limit).toHaveBeenCalledWith(100);
    expect(mockQueryChain.lean).toHaveBeenCalled();
  });

  it('should return message history with custom limit and before', async () => {
    const cmd = { a: 'user1', b: 'user2', limit: 30, before: 1696500000000 };
    const result = await handler.execute(cmd);
    expect(result).toEqual({ msgs: [] });

    expect(msgModel.find).toHaveBeenCalledWith({
      $or: [{ from: 'user1', to: 'user2' }, { from: 'user2', to: 'user1' }],
      ts: { $lt: 1696500000000 },
    });
    expect(mockQueryChain.sort).toHaveBeenCalledWith({ ts: 1 });
    expect(mockQueryChain.limit).toHaveBeenCalledWith(30);
    expect(mockQueryChain.lean).toHaveBeenCalled();
  });
});
