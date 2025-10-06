import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { JwtService } from '@nestjs/jwt'
import { ConflictException } from '@nestjs/common'
import { RegisterHandler } from './register.handler'
import { User } from '@/users/schemas/user.schema'

jest.mock('bcrypt', () => ({ hash: jest.fn() }))
import * as bcrypt from 'bcrypt'

const lean = <T>(v: T) => ({ lean: jest.fn().mockResolvedValue(v) })

describe('RegisterHandler', () => {
  let handler: RegisterHandler
  let userModel: any
  let jwt: JwtService

  beforeEach(async () => {
    userModel = { findOne: jest.fn(), create: jest.fn() }
    jwt = { sign: jest.fn().mockReturnValue('token') } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterHandler,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile()

    handler = module.get(RegisterHandler)
    jest.clearAllMocks()
  })

  it('should throw if username is taken', async () => {
    userModel.findOne
      .mockReturnValueOnce(lean({ _id: 'u' }))
      .mockReturnValueOnce(lean(null))

    await expect(
      handler.execute({ username: 'TestUser', email: 'x@y.com', password: '123456' }),
    ).rejects.toThrow(ConflictException)
  })

  it('should throw if email is already in use', async () => {
    userModel.findOne
      .mockReturnValueOnce(lean(null))
      .mockReturnValueOnce(lean({ _id: 'e' }))

    await expect(
      handler.execute({ username: 'testuser', email: 'X@Y.COM', password: '123456' }),
    ).rejects.toThrow(ConflictException)
  })

  it('should create user and return access token', async () => {
    userModel.findOne.mockReturnValue(lean(null))
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
    userModel.create.mockResolvedValue({ _id: '1', username: 'testuser' })

    const dto = { username: 'TestUser', email: 'X@Y.COM', password: '123456' }
    const res = await handler.execute(dto)

    expect(res.access_token).toBe('token')
    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'testuser',
        email: 'x@y.com',
        password: 'hashed',
      }),
    )
  })
})
