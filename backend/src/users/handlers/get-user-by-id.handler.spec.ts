import { Test, TestingModule } from '@nestjs/testing';
import { GetUserByIdHandler } from './get-user-by-id.handler';
import { UsersService } from '../users.service';

describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler;
  const mockUsers = { findById: jest.fn(async (id:string) => id==='1' ? { _id:'1', username:'a' } : null) };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdHandler,
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    handler = module.get(GetUserByIdHandler);
  });

  it('returns user when found', async () => {
    const res = await handler.execute({ id: '1' });
    expect(res.user).toBeDefined();
  });

  it('throws when not found', async () => {
    await expect(handler.execute({ id: 'x' })).rejects.toBeDefined();
  });
});
