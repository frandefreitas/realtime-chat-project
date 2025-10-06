import { Test, TestingModule } from '@nestjs/testing'
import { ChatController } from './chat.controller'
import { SendDirectHandler } from '../handlers/send-direct.handler'
import { GetHistoryHandler } from '../handlers/get-history.handler'

describe('ChatController', () => {
  let controller: ChatController
  let sendDirect: jest.Mocked<SendDirectHandler>
  let getHistory: jest.Mocked<GetHistoryHandler>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: SendDirectHandler, useValue: { execute: jest.fn() } },
        { provide: GetHistoryHandler, useValue: { execute: jest.fn() } },
      ],
    }).compile()

    controller = module.get(ChatController)
    sendDirect = module.get(SendDirectHandler) as jest.Mocked<SendDirectHandler>
    getHistory = module.get(GetHistoryHandler) as jest.Mocked<GetHistoryHandler>
  })

  it('deve enviar mensagem com body correto', async () => {
    sendDirect.execute.mockResolvedValue({ ok: true })
    const body = { from: 'u1', to: 'u2', text: 'hi' }
    const res = await controller.send(body)
    expect(sendDirect.execute).toHaveBeenCalledWith(body)
    expect(res).toEqual({ ok: true })
  })

  it('deve retornar histórico com conversão de limit e before', async () => {
    const mocked = { msgs: [{ id: 1 }] }
    getHistory.execute.mockResolvedValue(mocked)
    const res = await controller.history('u1', 'u2', '50', String(1700000000000))
    expect(getHistory.execute).toHaveBeenCalledWith({
      a: 'u1',
      b: 'u2',
      limit: 50,
      before: 1700000000000,
    })
    expect(res).toBe(mocked)
  })

  it('deve retornar histórico sem before quando não informado', async () => {
    const mocked = { msgs: [] }
    getHistory.execute.mockResolvedValue(mocked)
    const res = await controller.history('u1', 'u2', '25', undefined)
    expect(getHistory.execute).toHaveBeenCalledWith({
      a: 'u1',
      b: 'u2',
      limit: 25,
      before: undefined,
    })
    expect(res).toBe(mocked)
  })
})
