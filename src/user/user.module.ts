import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUseHandler } from './handlers/create-user.handler';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RedisModule } from 'src/redis/redis.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [CqrsModule, PrismaModule, RedisModule, KafkaModule],
  providers: [UserService, CreateUseHandler],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
