import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersHandler } from './list-users.handler';
import { UsersService } from '../users.service';

describe('ListUsersHandler', () => {
  let handler: ListUsersHandler;
  const mockUsers = {
    findAllUsernames: jest.fn(async () => [{ _id: '1', username: 'a' }]),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersHandler,
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    handler = module.get(ListUsersHandler);
  });

  beforeEach(() => jest.clearAllMocks());

  it('retorna lista de users', async () => {
    const res = await handler.execute({});
    expect(mockUsers.findAllUsernames).toHaveBeenCalled();
    expect(res.users).toHaveLength(1);
  });
});