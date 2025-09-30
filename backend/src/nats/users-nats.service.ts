import { Injectable } from '@nestjs/common';
import { NatsClientService } from './nats-client.service';

@Injectable()
export class UsersNatsService {
  constructor(private readonly nats: NatsClientService) {}

  list() {
    return this.nats.publishAndWait({
      cfg: 'core.users.list',
      res: 'core.users.list',
      data: {},
    });
  }

  get(userId: string) {
    return this.nats.publishAndWait({
      cfg: 'core.users.get',
      res: 'core.users.get',
      data: { userId },
    });
  }

  create(input: any) {
    return this.nats.publishAndWait({
      cfg: 'core.users.create',
      res: 'core.users.create',
      data: input,
    });
  }

  update(userId: string, patch: any) {
    return this.nats.publishAndWait({
      cfg: 'core.users.update',
      res: 'core.users.update',
      data: { userId, ...patch },
    });
  }

  delete(userId: string) {
    return this.nats.publishAndWait({
      cfg: 'core.users.delete',
      res: 'core.users.delete',
      data: { userId },
    });
  }

  getByLocalDefault(localDefault: string) {
    return this.nats.publishAndWait({
      cfg: 'core.users.get_by_local_default',
      res: 'core.users.get_by_local_default',
      data: { localDefault },
    });
  }
}
