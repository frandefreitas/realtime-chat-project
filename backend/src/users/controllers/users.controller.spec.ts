import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { GetUserByIdHandler } from '../handlers/get-user-by-id.handler';
import { ListUsersHandler } from '../handlers/list-users.handler';
import { CreateUserHandler } from '../handlers/create-user.handler';
import { FindUsersHandler } from '../handlers/find-users.handler';

describe('UsersController', () => {
  let controller: UsersController;
  let getUserByIdHandler: jest.Mocked<GetUserByIdHandler>;
  let listUsersHandler: jest.Mocked<ListUsersHandler>;
  let createUserHandler: jest.Mocked<CreateUserHandler>;
  let findUsersHandler: jest.Mocked<FindUsersHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: GetUserByIdHandler, useValue: { execute: jest.fn() } },
        { provide: ListUsersHandler, useValue: { execute: jest.fn() } },
        { provide: CreateUserHandler, useValue: { execute: jest.fn() } },
        { provide: FindUsersHandler, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    getUserByIdHandler = module.get(GetUserByIdHandler);
    listUsersHandler = module.get(ListUsersHandler);
    createUserHandler = module.get(CreateUserHandler);
    findUsersHandler = module.get(FindUsersHandler);
  });

  it('getByIdRoute chama handler com o id correto', async () => {
    getUserByIdHandler.execute.mockResolvedValue({ id: '123', username: 'john' });
    const result = await controller.getByIdRoute('123');
    expect(getUserByIdHandler.execute).toHaveBeenCalledWith({ id: '123' });
    expect(result).toEqual({ id: '123', username: 'john' });
  });

  it('listAll chama listUsersHandler com {}', async () => {
    listUsersHandler.execute.mockResolvedValue([{ id: '1' }]);
    const result = await controller.listAll();
    expect(listUsersHandler.execute).toHaveBeenCalledWith({});
    expect(result).toEqual([{ id: '1' }]);
  });

  it('find chama findUsersHandler com o q correto', async () => {
    findUsersHandler.execute.mockResolvedValue([{ id: 'x', username: 'match' }]);
    const result = await controller.find('joao', '30');
    expect(findUsersHandler.execute).toHaveBeenCalledWith({ q: 'joao' });
    expect(result).toEqual([{ id: 'x', username: 'match' }]);
  });

  it('create chama createUserHandler com body', async () => {
    const body = { username: 'new', email: 'new@test.com' };
    createUserHandler.execute.mockResolvedValue({ id: '999', ...body });
    const result = await controller.create(body);
    expect(createUserHandler.execute).toHaveBeenCalledWith(body);
    expect(result).toEqual({ id: '999', ...body });
  });
});
