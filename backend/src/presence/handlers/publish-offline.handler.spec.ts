import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { PublishOfflineHandler, PublishOfflineCommand } from './publish-offline.handler'
import { BrokerClientService } from '@/broker/broker-client.service'

describe('PublishOfflineHandler', () => {
  let handler: PublishOfflineHandler
  let broker: { publish: jest.Mock }
  const FIXED_NOW = 1_726_000_000_000

  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => FIXED_NOW)
    broker = { publish: jest.fn() }

    const mod = await Test.createTestingModule({
      providers: [
        PublishOfflineHandler,
        { provide: BrokerClientService, useValue: broker },
      ],
    }).compile()

    handler = mod.get(PublishOfflineHandler)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('publica offline e retorna ok', async () => {
    const cmd: PublishOfflineCommand = { userId: 'user-123' }
    const res = await handler.execute(cmd)
    expect(broker.publish).toHaveBeenCalledWith('presence.offline.user-123', { t: FIXED_NOW })
    expect(res).toEqual({ ok: true })
  })

  it('usa o userId no subject', async () => {
    await handler.execute({ userId: 'abc' })
    expect(broker.publish).toHaveBeenLastCalledWith('presence.offline.abc', { t: FIXED_NOW })
  })
})
