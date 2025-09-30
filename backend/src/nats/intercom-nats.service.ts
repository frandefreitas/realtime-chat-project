import { Injectable } from '@nestjs/common';
import { NatsClientService } from './nats-client.service';

@Injectable()
export class IntercomNatsService {
  constructor(private readonly nats: NatsClientService) {}

  getByInterval(start_time: string, end_time: string, limit?: number) {
    return this.nats.publishAndWait({
      cfg: 'core.intercom.get_by_interval',
      res: 'core.intercom.get_by_interval',
      data: { start_time, end_time, limit },
    });
  }

  getByIntervalAndChannel(start_time: string, end_time: string, channel: string, limit?: number) {
    return this.nats.publishAndWait({
      cfg: 'core.intercom.get_by_interval_and_channel',
      res: 'core.intercom.get_by_interval_and_channel',
      data: { start_time, end_time, channel, limit },
    });
  }
}
