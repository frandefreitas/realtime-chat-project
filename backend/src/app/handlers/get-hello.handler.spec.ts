import { Test, TestingModule } from '@nestjs/testing';
import { GetHelloHandler } from './get-hello.handler';
import { AppService } from '../app.service';

describe('GetHelloHandler', () => {
  let handler: GetHelloHandler;
  const mockApp = { getHello: jest.fn(() => 'Hello World!') };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHelloHandler,
        { provide: AppService, useValue: mockApp },
      ],
    }).compile();

    handler = module.get(GetHelloHandler);
  });

  it('should return message from AppService', async () => {
    const res = await handler.execute({});
    expect(res).toEqual({ message: 'Hello World!' });
    expect(mockApp.getHello).toHaveBeenCalled();
  });
});
