import { Injectable } from '@nestjs/common';
import { NatsService } from './nats.service';

export type PublishAndWaitInput = {
  cfg: string;        // subject da request
  res?: string;       // opcional (ignorado)
  data?: any;
  timeoutMs?: number;
};

@Injectable()
export class NatsClientService {
  constructor(private readonly nats: NatsService) {}

  async publishAndWait<T = any>(input: PublishAndWaitInput): Promise<T> {
    const { cfg, data, timeoutMs } = input;
    return this.nats.requestJSON<T>(cfg, data ?? {}, timeoutMs ?? 8000);
  }
}
