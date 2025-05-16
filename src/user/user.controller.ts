import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserCommand } from './commands/create-user.command';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }
}
