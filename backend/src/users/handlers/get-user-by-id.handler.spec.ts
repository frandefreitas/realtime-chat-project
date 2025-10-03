import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByIdHandler } from './get-user-by-id.handler';
import { UsersService } from '../users.service';
import { NotFoundException } from '@nestjs/common';

describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler;
  const mockUsers = {
    findById: jest.fn(async (id: string) => (id === '1' ? { _id: '1', username: 'john' } : null)),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdHandler,
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    handler = module.get(GetUserByIdHandler);
  });

  beforeEach(() => jest.clearAllMocks());

  it('retorna user quando existe', async () => {
    const res = await handler.execute({ id: '1' });
    expect(mockUsers.findById).toHaveBeenCalledWith('1');
    expect(res.user).toMatchObject({ _id: '1', username: 'john' });
  });

  it('lança NotFound quando não existe', async () => {
    await expect(handler.execute({ id: 'x' })).rejects.toBeInstanceOf(NotFoundException);
  });
});
