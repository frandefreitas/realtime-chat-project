import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserHandler } from './create-user.handler';
import { UsersService } from '../users.service';
import { BadRequestException } from '@nestjs/common';

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler;
  const mockUsers = {
    create: jest.fn(async (dto) => ({ _id: 'id1', ...dto })),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        { provide: UsersService, useValue: mockUsers },
      ],
    }).compile();

    handler = module.get(CreateUserHandler);
  });

  beforeEach(() => jest.clearAllMocks());

  it('preenche name com username quando não vier name', async () => {
    const res = await handler.execute({
      username: 'John ',
      email: ' JOHN@EXAMPLE.COM ',
      password: 'x',
    });
    expect(mockUsers.create).toHaveBeenCalled();
    expect(res).toHaveProperty('_id', 'id1');
    expect(res.name).toBe('John');
    expect(res.username).toBe('John');
    expect(res.email).toBe('john@example.com');
  });

  it('usa name quando fornecido', async () => {
    const res = await handler.execute({
      name: 'John Doe',
      username: 'jdoe',
      email: 'JD@E.COM',
      password: 'x',
    });
    expect(res.name).toBe('John Doe');
    expect(res.username).toBe('jdoe');
    expect(res.email).toBe('jd@e.com');
  });

  it('lança erro sem campos obrigatórios', async () => {
    await expect(handler.execute({} as any)).rejects.toBeInstanceOf(BadRequestException);
  });
});
