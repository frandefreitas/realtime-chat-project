import { Test, TestingModule } from '@nestjs/testing'
import { PresenceController } from './presence.controller'
import { GetOnlineHandler } from '../handlers/get-online.handler'
import { PublishOnlineHandler } from '../handlers/publish-online.handler'
import { PublishOfflineHandler } from '../handlers/publish-offline.handler'
import { BadRequestException } from '@nestjs/common'

describe('PresenceController', () => {
  let controller: PresenceController
  let getOnlineHandler: { execute: jest.Mock }
  let publishOnlineHandler: { execute: jest.Mock }
  let publishOfflineHandler: { execute: jest.Mock }

  beforeEach(async () => {
    getOnlineHandler = { execute: jest.fn().mockResolvedValue(['u1', 'u2']) }
    publishOnlineHandler = { execute: jest.fn().mockResolvedValue({ ok: true }) }
    publishOfflineHandler = { execute: jest.fn().mockResolvedValue({ ok: true }) }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresenceController],
      providers: [
        { provide: GetOnlineHandler, useValue: getOnlineHandler },
        { provide: PublishOnlineHandler, useValue: publishOnlineHandler },
        { provide: PublishOfflineHandler, useValue: publishOfflineHandler },
      ],
    }).compile()

    controller = module.get(PresenceController)
  })

  it('should list online', async () => {
    const r = await controller.getOnline()
    expect(r).toEqual(['u1', 'u2'])
    expect(getOnlineHandler.execute).toHaveBeenCalled()
  })

  it('should publish online', async () => {
    const r = await controller.publish({ userId: 'abc' } as any)
    expect(r).toEqual({ ok: true })
    expect(publishOnlineHandler.execute).toHaveBeenCalledWith({ userId: 'abc' })
  })

  it('should throw BadRequest if offline called without userId', () => {
    expect(() => controller.offline({} as any)).toThrow(BadRequestException)
  })

  it('should publish offline', async () => {
    const r = await controller.offline({ userId: 'abc' } as any)
    expect(r).toEqual({ ok: true })
    expect(publishOfflineHandler.execute).toHaveBeenCalledWith({ userId: 'abc' })
  })
})
