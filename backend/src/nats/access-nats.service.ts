import { Injectable } from '@nestjs/common';
import { NatsClientService } from './nats-client.service';

@Injectable()
export class AccessNatsService {
  constructor(private readonly nats: NatsClientService) {}

  search(params: {
    start_time: string;
    end_time: string;
    filters?: { user_id?: string; guest?: string; device_id?: string; accept?: boolean; access_type?: string; local?: string; };
    limit?: number;
  }) {
    return this.nats.publishAndWait({
      cfg: 'core.access.search',
      res: 'core.access.search',
      data: params,
    });
  }
}
