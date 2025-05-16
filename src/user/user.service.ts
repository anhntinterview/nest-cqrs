import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const user = await this.prisma.user.create({ data: dto });
      await this.redisService.getClient().del('users:all');
      return user;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException(`Email '${dto.email}' was exist.`);
      }
      throw new Error(
        err instanceof Error ? err.message : 'Unknown error occurred',
      );
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User Not Found');

      const updated = await this.prisma.user.update({
        where: { id },
        data: dto,
      });

      const redis = this.redisService.getClient();
      await redis.del(`user:${id}`, 'users:all');

      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async delete(id: number): Promise<{ deleted: boolean }> {
    try {
      await this.prisma.user.delete({ where: { id } });

      const redis = this.redisService.getClient();
      await redis.del(`user:${id}`, 'users:all');

      return { deleted: true };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        // P2025: record to delete does not exist
        throw new NotFoundException('User Not Found');
      }

      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const redis = this.redisService.getClient();
      const cacheKey = `user:${id}`;
      const cached = await redis.get(cacheKey);

      if (cached) return JSON.parse(cached) as User;

      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('User Not Found');

      await redis.set(cacheKey, JSON.stringify(user), 'EX', 60);

      return user;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const redis = this.redisService.getClient();
      const cacheKey = 'users:all';

      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as User[];

      const users = await this.prisma.user.findMany();

      await redis.set(cacheKey, JSON.stringify(users), 'EX', 60);

      return users;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  }
}
