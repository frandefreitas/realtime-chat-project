import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { ListUsersHandler } from './list-users.handler'
import { User } from '../schemas/user.schema'

const lean = <T>(v: T) => ({ lean: jest.fn().mockResolvedValue(v) })

describe('ListUsersHandler', () => {
  let handler: ListUsersHandler
  let modelMock: any

  beforeEach(async () => {
    modelMock = { find: jest.fn() }

    const moduleRef = await Test.createTestingModule({
      providers: [
        ListUsersHandler,
        { provide: getModelToken(User.name), useValue: modelMock },
      ],
    }).compile()

    handler = moduleRef.get(ListUsersHandler)
    jest.clearAllMocks()
  })

  it('lista usuários', async () => {
    modelMock.find.mockReturnValue(
      lean([{ _id: '1', username: 'a' }, { _id: '2', username: 'b' }]),
    )
    const res = await handler.execute({})
    expect(res.users).toHaveLength(2)
    expect(modelMock.find).toHaveBeenCalledWith({}, { username: 1, name: 1, email: 1 })
  })
})
