import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { KafkaModule } from './kafka/kafka.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientKafka } from '@nestjs/microservices';

@Module({
  imports: [UserModule, RedisModule, KafkaModule, PrismaModule],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Register topic send and receive
    this.kafkaClient.subscribeToResponseOf('user.created');
    await this.kafkaClient.connect();
  }
}
