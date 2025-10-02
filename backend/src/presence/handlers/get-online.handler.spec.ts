import { Test, TestingModule } from '@nestjs/testing';
import { GetOnlineHandler } from './get-online.handler';
import { PresenceService } from '../presence.service';

describe('GetOnlineHandler', () => {
  let handler: GetOnlineHandler;
  const mockPresence = { listOnline: jest.fn(() => [{ username:'a' }]) };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOnlineHandler,
        { provide: PresenceService, useValue: mockPresence },
      ],
    }).compile();

    handler = module.get(GetOnlineHandler);
  });

  it('returns users from presence', async () => {
    const res = await handler.execute({});
    expect(res.users).toHaveLength(1);
  });
});
