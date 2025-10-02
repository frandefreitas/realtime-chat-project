import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersHandler } from './list-users.handler';
import { UsersService } from '../users.service';

describe('ListUsersHandler', () => {
  let handler: ListUsersHandler;
  const mockUsers = { findAllUsernames: jest.fn(async () => ['a','b']) };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersHandler,
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    handler = module.get(ListUsersHandler);
  });

  it('lists usernames', async () => {
    const res = await handler.execute({});
    expect(res.users).toEqual(['a','b']);
  });
});
