import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersNatsService } from './users-nats.service';
import { IntercomNatsService } from './intercom-nats.service';
import { AccessNatsService } from './access-nats.service';
import { PresenceService } from '../presence/presence.service';
import { UsersService } from '@/users/users.service';

@Controller('nats')
export class NatsProxyController {
  constructor(
    private readonly users: UsersNatsService,
    private readonly intercom: IntercomNatsService,
    private readonly access: AccessNatsService,
    private usersService: UsersService,
    private readonly presence: PresenceService, // 👈 adicionado
  ) {}

  // USERS (originais)
  @Get('users')
  listUsers() { return this.users.list(); }

  @Get('users/:userId')
  getUser(@Param('userId') userId: string) { return this.users.get(userId); }

  @Post('users')
  createUser(@Body() body: any) { return this.users.create(body); }

  @Post('users/:userId')
  updateUser(@Param('userId') userId: string, @Body() patch: any) { return this.users.update(userId, patch); }

  @Post('users/:userId/delete')
  deleteUser(@Param('userId') userId: string) { return this.users.delete(userId); }

  @Get('users/by-local')
  getUsersByLocal(@Query('localDefault') localDefault: string) { return this.users.getByLocalDefault(localDefault); }

  // ✅ NOVO: todos os usuários com flag `online`
  @Get('users-with-presence')
  async usersWithPresence() {
    
    const list = await this.usersService.findAll(); // deve devolver array de usuários (via NATS)
    
    // Espera-se que cada user tenha um campo `id` ou `_id` (ajuste conforme seu retorno)
    return list.map((u: any) => {
      const id = String(u.id ?? u._id ?? u.userId ?? '');
      return { ...u, online: id ? this.presence.isOnline(id) : false };
    });
  }

  // INTERCOM
  @Get('intercom/interval')
  getIntercomByInterval(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('limit') limit?: string,
  ) {
    return this.intercom.getByInterval(start, end, limit ? Number(limit) : undefined);
  }

  @Get('intercom/interval-channel')
  getIntercomByIntervalAndChannel(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('channel') channel: string,
    @Query('limit') limit?: string,
  ) {
    return this.intercom.getByIntervalAndChannel(start, end, channel, limit ? Number(limit) : undefined);
  }

  // ACCESS
  @Post('access/search')
  searchAccess(@Body() body: any) {
    return this.access.search(body);
  }
}
