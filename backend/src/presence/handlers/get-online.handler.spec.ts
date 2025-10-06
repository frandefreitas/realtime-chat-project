import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { GetOnlineHandler } from './get-online.handler'
import { BrokerClientService } from '@/broker/broker-client.service'
import { User } from '@/users/schemas/user.schema'
import { isValidObjectId } from 'mongoose'

jest.mock('mongoose', () => ({
  ...(jest.requireActual('mongoose') as any),
  isValidObjectId: jest.fn(),
}))

const lean = <T>(v: T) => ({ lean: jest.fn().mockResolvedValue(v) })

describe('GetOnlineHandler', () => {
  let handler: GetOnlineHandler
  let broker: BrokerClientService
  let userModel: any

  beforeEach(async () => {
    jest.useFakeTimers()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOnlineHandler,
        { provide: BrokerClientService, useValue: { subscribe: jest.fn() } },
        {
          provide: getModelToken(User.name),
          useValue: { find: jest.fn().mockReturnValue(lean([])) },
        },
      ],
    }).compile()

    handler = module.get(GetOnlineHandler)
    broker = module.get(BrokerClientService)
    userModel = module.get(getModelToken(User.name))
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  it('should return empty users when no one is online', async () => {
    const result = await handler.execute({})
    expect(result).toEqual({ users: [] })
  })

  it('should enrich online users and return them', async () => {
    const now = Date.now()
    const id1 = 'valid-id'
    const id2 = 'user123'
    ;(isValidObjectId as jest.Mock).mockImplementation((id: string) => id === 'valid-id')

    ;(handler as any).online.set(id1, { userId: id1, lastSeen: now })
    ;(handler as any).online.set(id2, { userId: id2, lastSeen: now })

    userModel.find.mockReturnValue(
      lean([
        { _id: 'valid-id', name: 'João', username: 'joao' },
        { _id: 'ignored', name: 'Maria', username: 'user123' },
      ]),
    )

    const result = await handler.execute({})
    expect(result).toEqual({
      users: [
        { userId: 'valid-id', lastSeen: now, name: 'João', username: 'joao' },
        { userId: 'user123', lastSeen: now, name: 'Maria', username: 'user123' },
      ],
    })

    expect(userModel.find).toHaveBeenCalledWith(
      { $or: [{ _id: { $in: ['valid-id'] } }, { username: { $in: ['user123'] } }] },
      { name: 1, username: 1 },
    )
  })

  it('should clean stale users after TTL expires', async () => {
    await handler.onModuleInit()
    const userId = 'abc'
    const now = Date.now()
    ;(handler as any).online.set(userId, { userId, lastSeen: now - 30000 })
    jest.advanceTimersByTime(5000)
    const stillOnline = (handler as any).online.has(userId)
    expect(stillOnline).toBe(false)
  })

  it('should subscribe to heartbeat and offline topics on init', async () => {
    await handler.onModuleInit()
    expect(broker.subscribe).toHaveBeenCalledWith('presence.heartbeat.*', expect.any(Function))
    expect(broker.subscribe).toHaveBeenCalledWith('presence.offline.*', expect.any(Function))
  })

  it('should clear interval on module destroy', async () => {
    await handler.onModuleInit()
    const spy = jest.spyOn(global, 'clearInterval')
    handler.onModuleDestroy()
    expect(spy).toHaveBeenCalled()
  })
})
