import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, isValidObjectId } from 'mongoose'
import { ICommandHandler } from '@/common/interfaces/command-handler.interface'
import { BrokerClientService } from '@/broker/broker-client.service'
import { User, UserDocument } from '@/users/schemas/user.schema'

export interface GetOnlineCommand {}
export interface GetOnlineResult {
  users: { userId: string; lastSeen: number; name?: string; username?: string }[]
}

@Injectable()
export class GetOnlineHandler implements ICommandHandler<GetOnlineCommand, GetOnlineResult>, OnModuleInit, OnModuleDestroy {
  private online = new Map<string, { userId: string; lastSeen: number }>()
  private readonly ttlMs = 25_000
  private timer?: NodeJS.Timer

  constructor(
    private readonly broker: BrokerClientService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    this.broker.subscribe('presence.heartbeat.*', (topic) => {
      const parts = topic.split('.')
      const userId = parts[parts.length - 1]
      if (!userId) return
      this.online.set(userId, { userId, lastSeen: Date.now() })
    })

    this.broker.subscribe('presence.offline.*', (topic) => {
      const parts = topic.split('.')
      const userId = parts[parts.length - 1]
      if (!userId) return
      this.online.delete(userId)
    })

    this.timer = setInterval(() => {
      const now = Date.now()
      for (const [id, u] of this.online) {
        if (now - u.lastSeen > this.ttlMs) this.online.delete(id)
      }
    }, 5000)
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer as any)
  }

  async execute(_: GetOnlineCommand): Promise<GetOnlineResult> {
    const now = Date.now()
    const alive = [...this.online.values()].filter(u => now - u.lastSeen <= this.ttlMs)
    if (alive.length === 0) return { users: [] }

    const ids = alive.map(u => u.userId)
    const objIds = ids.filter(isValidObjectId)
    const usernames = ids.filter(id => !isValidObjectId(id))

    const or: any[] = []
    if (objIds.length) or.push({ _id: { $in: objIds } })
    if (usernames.length) or.push({ username: { $in: usernames } })

    const users = or.length
      ? await this.userModel.find({ $or: or }, { name: 1, username: 1 }).lean()
      : []

    const meta = new Map<string, { name?: string; username?: string }>()
    for (const u of users) {
      meta.set(String(u._id), { name: u.name, username: (u as any).username })
      if ((u as any).username) meta.set((u as any).username, { name: u.name, username: (u as any).username })
    }

    const enriched = alive.map(u => ({ ...u, ...(meta.get(u.userId) || {}) }))
    return { users: enriched }
  }
}
