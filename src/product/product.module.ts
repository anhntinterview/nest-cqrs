import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { KafkaModule } from 'src/kafka/kafka.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { ProductService } from './product.service';
import { CreateProductHandler } from './handlers/create-product.handler';
import { ProductResolver } from './product.resolver';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [CqrsModule, PrismaModule, RedisModule, KafkaModule, UserModule],
  providers: [ProductService, CreateProductHandler, ProductResolver],
})
export class ProductModule {}
