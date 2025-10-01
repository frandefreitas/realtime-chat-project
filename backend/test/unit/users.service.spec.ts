import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from '@/users/users.service';

describe('UsersService (unit)', () => {
  let service: UsersService;

  const findLean = jest.fn().mockResolvedValue([{ username: 'francisco' }, { username: 'bruna' }]);
  const find = jest.fn().mockImplementation((_filter?: any, _proj?: any) => ({ lean: findLean }));

  const findOneLean = jest.fn().mockResolvedValue({ _id: '1', username: 'francisco', password: 'hashed:123' });
  const findOneSelect = jest.fn(() => ({ lean: findOneLean }));
  const findOne = jest.fn(() => ({ select: findOneSelect }));

  const findByIdLean = jest.fn().mockResolvedValue({ _id: '1', username: 'francisco' });
  const findById = jest.fn(() => ({ lean: findByIdLean }));

  const model = { find, findOne, findById };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken('User'), useValue: model },
      ],
    }).compile();
    service = moduleRef.get(UsersService);
  });

  it('findAllUsernames: deve retornar array', async () => {
    const res: any = await (service as any).findAllUsernames();
    expect(Array.isArray(res)).toBe(true);
    expect(find).toHaveBeenCalledWith({}, { username: 1, _id: 0 });
  });

  it('findWithPasswordByUsername: deve retornar usuário com senha', async () => {
    const res: any = await (service as any).findWithPasswordByUsername('francisco');
    expect(findOne).toHaveBeenCalledWith({ username: 'francisco' });
    expect(findOneSelect).toHaveBeenCalledWith('+password');
    expect(res).toHaveProperty('password');
  });

  it('findById: deve retornar usuário pelo id', async () => {
    const res: any = await (service as any).findById('1');
    expect(findById).toHaveBeenCalledWith('1');
    expect(res).toHaveProperty('_id', '1');
  });
});
