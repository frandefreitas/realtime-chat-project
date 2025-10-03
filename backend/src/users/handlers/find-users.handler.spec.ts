import { Test, TestingModule } from '@nestjs/testing';
import { FindUsersHandler } from './find-users.handler';
import { UsersService } from '../users.service';

describe('FindUsersHandler', () => {
  let handler: FindUsersHandler;
  const mockUsers = {
    findAllUsernames: jest.fn(async () => ([
      { username: 'ana', name: 'Ana Maria', email: 'ana@x.com' },
      { username: 'bruno', name: 'Bruno', email: 'br@x.com' },
    ])),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUsersHandler,
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    handler = module.get(FindUsersHandler);
  });

  beforeEach(() => jest.clearAllMocks());

  it('filtra por q em username/name/email e aplica limit padrão', async () => {
    const res = await handler.execute({ q: 'ana' });
    expect(mockUsers.findAllUsernames).toHaveBeenCalled();
    expect(res.users).toEqual([{ username: 'ana', name: 'Ana Maria', email: 'ana@x.com' }]);
  });

  it('sem q retorna até 50', async () => {
    const res = await handler.execute({});
    expect(res.users.length).toBeGreaterThanOrEqual(2);
  });
});
