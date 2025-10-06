import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FindUsersHandler } from './find-users.handler';
import { User } from '../schemas/user.schema';

describe('FindUsersHandler', () => {
  let handler: FindUsersHandler;
  let userModel: any;

  const mockQueryChain = {
    lean: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUsersHandler,
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn().mockReturnValue(mockQueryChain),
          },
        },
      ],
    }).compile();

    handler = module.get<FindUsersHandler>(FindUsersHandler);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return all users when no query is provided', async () => {
    const mockUsers = [
      { username: 'joao' },
      { username: 'maria' },
      { username: null },
    ];

    mockQueryChain.lean.mockResolvedValueOnce(mockUsers);

    const result = await handler.execute({});
    expect(result).toEqual({ users: ['joao', 'maria'] });
    expect(userModel.find).toHaveBeenCalledWith({}, { username: 1 });
  });

  it('should search using regex when query is provided', async () => {
    const mockUsers = [
      { username: 'joaof' },
      { username: 'joaom' },
    ];

    mockQueryChain.lean.mockResolvedValueOnce(mockUsers);

    const result = await handler.execute({ q: 'joao' });
    expect(result).toEqual({ users: ['joaof', 'joaom'] });

    const callArgs = userModel.find.mock.calls[0][0];
    expect(callArgs).toHaveProperty('$or');
    expect(Array.isArray(callArgs.$or)).toBe(true);
    expect(userModel.find).toHaveBeenCalledWith(expect.anything(), { username: 1 });
  });

  it('should escape regex special characters in query', async () => {
    mockQueryChain.lean.mockResolvedValueOnce([]);

    await handler.execute({ q: 'joao.*[a-z]' });

    const calledWith = userModel.find.mock.calls[0][0];
    const regex = calledWith.$or[0].username;
    expect(regex instanceof RegExp).toBe(true);
    expect(regex.toString()).not.toContain('.*');
    expect(regex.toString()).not.toContain('[a-z]');
  });
});
