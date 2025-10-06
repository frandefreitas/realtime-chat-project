import { CreateUserHandler } from './create-user.handler'
import { BadRequestException } from '@nestjs/common'

jest.mock('bcrypt', () => ({ hash: jest.fn() }))
import * as bcrypt from 'bcrypt'

const lean = <T>(v: T) => ({ lean: jest.fn().mockResolvedValue(v) })

describe('CreateUserHandler', () => {
  let findOne: jest.Mock
  let ModelCtor: any

  beforeEach(() => {
    findOne = jest.fn()
    ModelCtor = jest.fn()
    ;(bcrypt.hash as jest.Mock).mockReset()
  })

  it('should throw if username or email is already in use', async () => {
    findOne.mockReturnValueOnce(lean({ _id: '1' }))
    ModelCtor.findOne = findOne

    const handler = new CreateUserHandler(ModelCtor as any)

    await expect(
      handler.execute({ username: 'joao', email: 'joao@mail.com', password: '123' }),
    ).rejects.toThrow(BadRequestException)
  })

  it('should create user successfully and return sanitized object', async () => {
    findOne.mockReturnValueOnce(lean(null))
    ModelCtor.findOne = findOne

    const save = jest.fn().mockResolvedValue(undefined)
    const toObject = jest.fn().mockReturnValue({
      _id: '1',
      username: 'joao',
      email: 'j@mail.com',
      password: 'HASHED',
    })
    ModelCtor.mockImplementation((data: any) => ({ ...data, save, toObject }))

    ;(bcrypt.hash as jest.Mock).mockResolvedValue('HASHED')

    const handler = new CreateUserHandler(ModelCtor as any)

    const res = await handler.execute({ username: 'joao', email: 'j@mail.com', password: '123456' })

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
    expect(save).toHaveBeenCalled()
    expect(toObject).toHaveBeenCalled()
    expect(res).toMatchObject({ _id: '1', username: 'joao', email: 'j@mail.com' })
    expect((res as any).password).toBeUndefined()
  })
})
