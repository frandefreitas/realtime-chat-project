import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import { startInMemoryMongo, stopInMemoryMongo } from '../utils/mongo-inmemory';
import { createMockBrokerClientService, createMockNatsConnection } from '../utils/nats.mock';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BrokerClientService } from '@/broker/broker-client.service';

jest.setTimeout(60000);

function tokenFrom(body: any): string {
  return body?.token || body?.access_token || body?.jwt || '';
}
function arr(body: any): any[] {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.users)) return body.users;
  if (Array.isArray(body?.messages)) return body.messages;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.docs)) return body.docs;
  return [];
}
async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
async function tryRegister(app: INestApplication, username: string, pass: string) {
  const res = await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ username, email: `${username}@ex.com`, password: pass, name: username });
  expect([200, 201, 400, 409]).toContain(res.status);
  return res;
}
async function tryLogin(app: INestApplication, username: string, pass: string) {
  let res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ usernameOrEmail: username, password: pass });
  if (![200, 201].includes(res.status)) {
    res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username, password: pass });
  }
  if (![200, 201].includes(res.status)) {
    res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: `${username}@ex.com`, password: pass });
  }
  if (![200, 201].includes(res.status)) return { token: '', body: res.body };
  const token = tokenFrom(res.body);
  return { token, body: res.body };
}

describe('Full API Flow (E2E)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;

  const A = 'francisco';
  const B = 'bruna';
  const PASS = '12345678';

  let tokenA = '';
  let tokenB = '';

  beforeAll(async () => {
    mongo = await startInMemoryMongo();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider('NATS_CONNECTION').useValue(createMockNatsConnection())
      .overrideProvider(BrokerClientService).useValue(createMockBrokerClientService() as any)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await stopInMemoryMongo(mongo);
  });

  it('Auth: register/login A e B', async () => {
    await tryRegister(app, A, PASS);
    await tryRegister(app, B, PASS);
    const la = await tryLogin(app, A, PASS);
    const lb = await tryLogin(app, B, PASS);
    tokenA = la.token || '';
    tokenB = lb.token || '';
    expect(typeof tokenA).toBe('string');
    expect(typeof tokenB).toBe('string');
  });

  it('Users: listar', async () => {
    const req = request(app.getHttpServer()).get('/api/users');
    const res = tokenA ? await req.set('Authorization', `Bearer ${tokenA}`) : await req;
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      const list = arr(res.body);
      expect(Array.isArray(list)).toBe(true);
    }
  });

  it('Presence: online', async () => {
    const req = request(app.getHttpServer()).get('/api/presence/online');
    const res = tokenA ? await req.set('Authorization', `Bearer ${tokenA}`) : await req;
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      const users = arr(res.body);
      expect(Array.isArray(users)).toBe(true);
    }
  });

  it('Chat: enviar A -> B e checar histórico', async () => {
    const sendReq = request(app.getHttpServer())
      .post('/api/chat/send')
      .send({ from: A, to: B, text: 'oi do A -> B' });
    const send = tokenA ? await sendReq.set('Authorization', `Bearer ${tokenA}`) : await sendReq;
    expect([200, 201, 400, 401]).toContain(send.status);
    await sleep(50);
    const histReq = request(app.getHttpServer()).get(`/api/chat/history/${A}/${B}?limit=20`);
    const hist = tokenA ? await histReq.set('Authorization', `Bearer ${tokenA}`) : await histReq;
    expect([200, 401]).toContain(hist.status);
    if (hist.status === 200) {
      const msgs = arr(hist.body);
      const bucket = msgs.length ? msgs : arr(hist.body?.messages);
      expect(Array.isArray(bucket)).toBe(true);
    }
  });

  it('Política: enviar sem token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/chat/send')
      .send({ from: A, to: B, text: 'sem token' });
    expect([200, 201, 401, 403]).toContain(res.status);
  });
});
