import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateProductDTO } from './dto/create-product.dto';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateProductDTO): Promise<Product> {
    try {
      const product = await this.prisma.product.create({
        data: dto,
      });
      await this.redisService.getClient().del('products:all');
      return product;
    } catch (err: unknown) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException(
          `Product with name ${dto.name} already exist`,
        );
      }
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const redis = this.redisService.getClient();
      const cacheKey = 'products:all';

      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as Product[];

      const products = await this.prisma.product.findMany({
        include: { owner: true },
      });

      await redis.set(cacheKey, JSON.stringify(products), 'EX', 60);

      return products;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const redis = this.redisService.getClient();
      const cacheKey = `product:${id}`;

      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as Product;

      const product = await this.prisma.product.findUnique({
        where: { id },
        include: { owner: true },
      });

      if (!product) throw new NotFoundException('Product Not Found');

      await redis.set(cacheKey, JSON.stringify(product), 'EX', 60);

      return product;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  }
}
