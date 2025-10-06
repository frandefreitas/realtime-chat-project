import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { NotFoundException } from '@nestjs/common'
import { GetUserByIdHandler } from './get-user-by-id.handler'
import { User } from '../schemas/user.schema'

const lean = <T>(v: T) => ({ lean: jest.fn().mockResolvedValue(v) })

describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler
  let modelMock: any

  beforeEach(async () => {
    modelMock = { findById: jest.fn() }

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserByIdHandler,
        { provide: getModelToken(User.name), useValue: modelMock },
      ],
    }).compile()

    handler = moduleRef.get(GetUserByIdHandler)
    jest.clearAllMocks()
  })

  it('retorna usuário existente', async () => {
    const user = { _id: '651111111111111111111111', name: 'Alice', password: 'x' }
    modelMock.findById.mockReturnValue(lean(user))
    const res = await handler.execute({ id: '651111111111111111111111' })
    expect(res.user.name).toBe('Alice')
    expect(res.user.password).toBeUndefined()
  })

  it('lança se id inválido', async () => {
    await expect(handler.execute({ id: 'bad' })).rejects.toBeInstanceOf(NotFoundException)
  })

  it('lança se não encontrar', async () => {
    modelMock.findById.mockReturnValue(lean(null))
    await expect(handler.execute({ id: '651111111111111111111111' })).rejects.toBeInstanceOf(NotFoundException)
  })
})
