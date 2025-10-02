import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@/common/interfaces/command-handler.interface';
import { AppService } from '../../app.service';

export interface GetHelloCommand {}
export interface GetHelloResult { message: string; }

@Injectable()
export class GetHelloHandler implements ICommandHandler<GetHelloCommand, GetHelloResult> {
  constructor(private readonly app: AppService) {}

  async execute(_: GetHelloCommand): Promise<GetHelloResult> {
    return { message: this.app.getHello() };
  }
}
