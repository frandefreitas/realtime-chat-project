import { Injectable } from '@nestjs/common';
import { NatsService } from './nats.service';

@Injectable()
export class UsersNatsService {
  constructor(private readonly nats: NatsService) {}

  list() {
    return this.nats.requestJSON('core.users.list', {});
  }

  get(userId: string) {
    return this.nats.requestJSON('core.users.get', { userId });
  }

  create(input: any) {
    return this.nats.requestJSON('core.users.create', input);
  }

  update(userId: string, patch: any) {
    return this.nats.requestJSON('core.users.update', { userId, ...patch });
  }

  delete(userId: string) {
    return this.nats.requestJSON('core.users.delete', { userId });
  }

  getByLocalDefault(localDefault: string) {
    return this.nats.requestJSON('core.users.get_by_local_default', {
      localDefault,
    });
  }
}
