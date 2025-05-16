import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { Redis as RedisClientType } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: RedisClientType;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  getClient(): RedisClientType {
    return this.redisClient;
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
