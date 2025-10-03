import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { SendDirectHandler } from '../handlers/send-direct.handler';
import { GetHistoryHandler } from '../handlers/get-history.handler';

describe('ChatController', () => {
  let controller: ChatController;
  let sendDirectHandler: jest.Mocked<SendDirectHandler>;
  let getHistoryHandler: jest.Mocked<GetHistoryHandler>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: SendDirectHandler, useValue: { execute: jest.fn() } },
        { provide: GetHistoryHandler, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    sendDirectHandler = module.get(SendDirectHandler);
    getHistoryHandler = module.get(GetHistoryHandler);
  });

  it('deve chamar sendDirectHandler com os dados corretos', async () => {
    sendDirectHandler.execute.mockResolvedValue({ ok: true });
    const body = { from: 'a', to: 'b', text: 'hello' };
    const result = await controller.send(body);
    expect(sendDirectHandler.execute).toHaveBeenCalledWith(body);
    expect(result).toEqual({ ok: true });
  });

  it('deve chamar getHistoryHandler com os parâmetros corretos', async () => {
    const fakeHistory = [{ from: 'a', to: 'b', text: 'msg' }];
    getHistoryHandler.execute.mockResolvedValue(fakeHistory);

    const result = await controller.history('userA', 'userB', '50', '123456');
    expect(getHistoryHandler.execute).toHaveBeenCalledWith({
      a: 'userA',
      b: 'userB',
      limit: 50,
      before: 123456,
    });
    expect(result).toEqual(fakeHistory);
  });

  it('deve funcionar com before indefinido', async () => {
    const fakeHistory = [{ from: 'a', to: 'b', text: 'msg2' }];
    getHistoryHandler.execute.mockResolvedValue(fakeHistory);

    const result = await controller.history('userA', 'userB', '10');
    expect(getHistoryHandler.execute).toHaveBeenCalledWith({
      a: 'userA',
      b: 'userB',
      limit: 10,
      before: undefined,
    });
    expect(result).toEqual(fakeHistory);
  });
});
