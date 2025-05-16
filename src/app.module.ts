import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { KafkaModule } from './kafka/kafka.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClientKafka } from '@nestjs/microservices';

import { GraphQLModule } from '@nestjs/graphql';
import { ProductModule } from './product/product.module';
import { ApolloDriver } from '@nestjs/apollo';

@Module({
  imports: [
    UserModule,
    RedisModule,
    KafkaModule,
    PrismaModule,
    ProductModule,
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
    }),
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Register topic send and receive
    this.kafkaClient.subscribeToResponseOf('user.created');
    this.kafkaClient.subscribeToResponseOf('product.created');
    await this.kafkaClient.connect();
  }
}
